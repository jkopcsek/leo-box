import { Injectable } from "@nestjs/common";
import { Cron } from '@nestjs/schedule';
import { LeoBoxService } from "./leo-box.service";

@Injectable()
export class LeoBoxScheduler {
    constructor(private readonly leoBoxService: LeoBoxService) {}

    @Cron('0 * * * * *')
    public async updatePosition() {
        await this.leoBoxService.updatePosition();
    }
}