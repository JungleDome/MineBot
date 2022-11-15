import { BaseEntity, Between, Column, DeleteDateColumn, FindOptionsWhere, Generated, LessThanOrEqual, MoreThanOrEqual, PrimaryColumn } from "typeorm"

export default class StandardEntity extends BaseEntity {
    @PrimaryColumn()
    @Generated("uuid")
    id: string

    @Column({
        transformer: {
            from: (value: number) => new Date(value),
            to: (value: Date) => value instanceof Date ? value.getTime() : value,
        },
        default: () => Date.now()
    })
    createdDate: Date

    @Column({
        nullable: true,
        transformer: {
            from: (value: number) => new Date(value),
            to: (value: Date) => value instanceof Date ? value.getTime() : value,
        },
    })
    updatedDate: Date

    @DeleteDateColumn()
    deletedDate: Date

    static findByCreatedDate<T extends StandardEntity>(
        this: { new(): T; } & typeof StandardEntity,
        from: Date = null,
        to: Date = null,
        where: FindOptionsWhere<T> = {}
    ): Promise<T[]> {

        if (from)
            //@ts-ignore
            where.createdDate = MoreThanOrEqual(from.getTime())

        if (to)
            //@ts-ignore
            where.createdDate = LessThanOrEqual(to.getTime())

        if (from && to)
            //@ts-ignore
            where.createdDate = Between(from.getTime(), to.getTime())

        //@ts-ignore
        return this.find({
            where: where,
        })
        // let needAnd = false

        // if (where) {
        //     queryBuilder = queryBuilder.where(where)
        //     needAnd = true
        // }

        // if (from) {
        //     queryBuilder = queryBuilder[needAnd ? 'andWhere' : 'where']("createdDate > :from", { from: from.getTime() })
        //     needAnd = true
        // }

        // if (to) {
        //     queryBuilder = queryBuilder[needAnd ? 'andWhere' : 'where']("createdDate < :to ", { to: to.getTime() })
        // }

        //@ts-ignore
        return queryBuilder
    }
}