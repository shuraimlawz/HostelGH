import { IsString, IsUrl } from "class-validator";

export class SubmitProofDto {
  @IsUrl()
  proofUrl: string;

  @IsString()
  notes: string;
}
