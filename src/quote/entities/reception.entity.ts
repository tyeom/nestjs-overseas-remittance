import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm'
import { Quote } from './quote.entity'
import { Exclude } from "class-transformer";
import { User } from '../../users/entities/user.entity';
    
@Entity()
export class Reception extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Exclude()
    public receptionId!: number

    @OneToOne(
        (type) => Quote,
        (quote) => quote.quoteId
    )

    @JoinColumn({
        name: 'quote_id'
    })
    @Exclude()
    public quote!: Quote;

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