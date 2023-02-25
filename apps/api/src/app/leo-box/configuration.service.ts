import { Injectable } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigurationService {
    constructor(private readonly prisma: PrismaService) {
    }

    public async get(key: string): Promise<string> {
        const config = await this.prisma.configuration.findUnique({where: {key}});
        return config?.value;
    }

    public async set(key: string, value: string): Promise<void> {
        await this.prisma.configuration.upsert({
            where: {key},
            create: {key, value},
            update: {value},
        });
    }

    public async remove(key: string): Promise<void> {
        await this.prisma.configuration.delete({where: {key}});
    }
}