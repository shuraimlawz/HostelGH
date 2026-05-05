import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { SearchService } from "./search.service";

@Processor("hostel-indexing")
export class HostelProcessor extends WorkerHost {
  private readonly logger = new Logger(HostelProcessor.name);

  constructor(private readonly searchService: SearchService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { hostelId } = job.data;

    switch (job.name) {
      case "sync":
        this.logger.log(`Processing indexing for hostel: ${hostelId}`);
        await this.searchService.indexHostel(hostelId);
        break;
      
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
