import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { MusicTagDto } from "./dto/music-tag.dto";
import { MusicTagsDto } from "./dto/music-tags.dto";
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MusicTagService {
  constructor(private readonly prisma: PrismaService) {}

  public async getMusicTags(): Promise<MusicTagsDto> {
    return plainToInstance(MusicTagsDto, this.prisma.musicTag.findMany());
  }

  public async getMusicTag(uid: string): Promise<MusicTagDto> {
    return plainToInstance(MusicTagDto, this.prisma.musicTag.findUnique({where: {uid}}));
  }

  public async updateMusicTag(uid: string): Promise<MusicTagDto> {
    return plainToInstance(MusicTagDto, this.prisma.musicTag.findUnique({where: {uid}}));
  }

  public async deleteMusicTag(uid: string): Promise<MusicTagDto> {
    return plainToInstance(MusicTagDto, this.prisma.musicTag.findUnique({where: {uid}}));
  }
}
