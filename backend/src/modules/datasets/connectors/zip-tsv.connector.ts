import { Readable } from 'node:stream';
import unzipper from 'unzipper';
import { DatasetConnectorOutput, DatasetIngestionContext, DatasetSource } from '../dataset.types.js';
import { FileDownloadConnector } from './base.js';

interface ZipTsvConnectorOptions {
  downloadUrl: string;
  delimiter?: string;
}

export class ZipTsvConnector extends FileDownloadConnector {
  private readonly delimiter: string;

  constructor(source: DatasetSource, options: ZipTsvConnectorOptions) {
    super(source, { downloadUrl: options.downloadUrl });
    this.delimiter = options.delimiter ?? '\t';
  }

  protected override getFileExtension(): string {
    return '.jsonl';
  }

  async prepare(context: DatasetIngestionContext): Promise<DatasetConnectorOutput> {
    const download = await super.prepare(context);
    const buffer = await streamToBuffer(download.stream);

    const zip = await unzipper.Open.buffer(buffer);
    const firstEntry = zip.files.find((file: any) => typeof file.path === 'string' && file.path.toLowerCase().endsWith('.tsv')) as any;
    if (!firstEntry) {
      throw new Error(`ZIP archive for ${this.source} does not contain a TSV file`);
    }

    const entryStream = await firstEntry.open();
    const rawBuffer = await streamToBuffer(entryStream);
    const raw = rawBuffer.toString('utf8');

    const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) {
      return {
        stream: Readable.from(''),
        fileExtension: '.jsonl',
        contentType: 'application/jsonl',
        metadata: { itemCount: 0, headers: [] },
        itemCount: 0
      };
    }

    const [headerLine, ...rows] = lines;
    const headers = headerLine.split(this.delimiter).map((h) => h.trim());
    const jsonLines = rows.map((row) => {
      const values = row.split(this.delimiter);
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = values[index]?.trim() ?? '';
      });
      return JSON.stringify(record);
    });

    return {
      stream: Readable.from(jsonLines.join('\n')),
      fileExtension: '.jsonl',
      contentType: 'application/jsonl',
      metadata: { itemCount: jsonLines.length, headers },
      itemCount: jsonLines.length
    };
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
