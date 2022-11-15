import { Entity, Column, OneToMany } from "typeorm"
import Session from "./session"
import StandardEntity from "./standardEntity"

@Entity()
export default class BotLoginInfo extends StandardEntity {
    
    @Column()
    username: string

    @Column()
    password: string

    @Column()
    cracked: boolean

    @Column()
    serverHost: string

    @Column()
    serverPort: number

    @Column()
    serverVersion: string

    @OneToMany(() => Session, (session) => session.bot, {
        cascade: ['recover', 'soft-remove', 'remove'],
        onDelete: "CASCADE"
    })
    sessions: Session[]
}