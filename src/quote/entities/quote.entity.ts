import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { CurrencyType } from '../../users/enums/currency-type.enum'
import { Exclude } from "class-transformer";
    
@Entity()
export class Quote extends BaseEntity {
    @PrimaryGeneratedColumn()
    public quoteId!: number
    
    @Column('integer')
    @Exclude()
    public sourceAmount!: number

    @Column('decimal')
    @Exclude()
    public fee!: number

    @Column('varchar')
    @Exclude()
    public targetCurrency!: CurrencyType
    
    @Column('decimal')
    public exchangeRate!: number

    @Column('decimal')
    public targetAmount!: number

    @Column('timestamp')
    public expireTime!: Date;

    @Column('decimal')
    @Exclude()
    public usdExchangeRate!: number

    @Column('decimal')
    @Exclude()
    public usdAmount!: number

    @ManyToOne(
        (type) => User,
        (user) => user.id
    )

    @JoinColumn({
        name: 'user_id'
    })
    @Exclude()
    public user!: User;

    @CreateDateColumn({ type: 'timestamp' })
    @Exclude()
    public createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    @Exclude()
    public updatedAt!: Date;
}