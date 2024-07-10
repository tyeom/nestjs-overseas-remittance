import { Quote } from '../../quote/entities/quote.entity'
import { Reception } from '../../quote/entities/reception.entity'
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { IdType } from '../enums/id-type-enum'
import { Exclude } from "class-transformer";
    
@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number
    
    @Column('varchar')
    public userId!: string
    
    @Column('varchar')
    @Exclude()
    public password!: string

    @Column('varchar')
    public name!: string
    
    @Column({ type: 'varchar', default: IdType.REG_NO})
    public idType!: IdType

    @Column('varchar')
    public idValue!: string

    @OneToMany(
        (type) => Quote,
        (quote) => quote.user
    )
    public quotes!: Quote[];

    @OneToMany(
        (type) => Reception,
        (reception) => reception.user
    )
    public reception!: Reception[];

    @CreateDateColumn({ type: 'timestamp' })
    public createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    public updatedAt!: Date;
}