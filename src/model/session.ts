import { Entity, Column, ManyToOne } from "typeorm"
import BotLoginInfo from "./botLoginInfo"
import StandardEntity from "./standardEntity"

export enum SessionType {
    WEB = 0,
    BOT = 1
}

@Entity()
export default class Session extends StandardEntity {

    @Column()
    type: SessionType

    @Column({
        default: 0
    })
    duration: number

    
    @ManyToOne(() => BotLoginInfo, (bot) => bot.sessions, {
        cascade: ['insert'],
        nullable: true,
        eager: true,
    })
    bot: BotLoginInfo

    // static findByName(firstName: string, lastName: string) {
    //     return this.createQueryBuilder("user")
    //         .where("user.firstName = :firstName", { firstName })
    //         .andWhere("user.lastName = :lastName", { lastName })
    //         .getMany()
    // }
}