import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @Column()
  fechaEmision: Date;

  @Column()
  metodoPago: string;

  @Column('float')
  total: number;

  @Column('simple-json')
  productos: { nombre: string; precio: number; cantidad: number }[];
}