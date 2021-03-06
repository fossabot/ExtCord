import Discord from "discord.js";
import { Repository } from "typeorm";

import Database from "../../../database/database";
import BooleanConfigEntry from "../booleanentry";
import { IEntryInfo } from "../entry";
import BooleanConfigEntity from "./database/booleanconfigentity";

export default class BooleanGuildConfigEntry extends BooleanConfigEntry {
    private database: Database;
    private repo?: Repository<BooleanConfigEntity>;

    constructor(info: IEntryInfo, database: Database) {
        info.loadStage = 1;
        super(info);
        this.database = database;
    }

    public async guildGet(guild: Discord.Guild): Promise<boolean> {
        const entity = await this.guildGetEntity(guild);
        return entity.value;
    }

    public async guildSet(guild: Discord.Guild, value: boolean) {
        const entity = await this.guildGetEntity(guild);
        entity.value = value;
        await this.repo!.save(entity);
    }

    private async ensureRepo() {
        if (this.repo) { return; }
        this.repo = await this.database.connection!.getRepository(BooleanConfigEntity);
    }

    private async guildGetEntity(guild: Discord.Guild) {
        await this.ensureRepo();
        let entity = await this.repo!.findOne({ where: {
            guildId: guild.id,
            name: this.fullName,
        }});
        if (!entity) {
            const guildEntity = await this.database.repos.guild!.getEntity(guild);
            entity = await this.repo!.create({
                guild: guildEntity,
                name: this.fullName,
                value: this.get(),
            });
        }
        return entity;
    }
}
