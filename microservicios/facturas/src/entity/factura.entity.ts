import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string;

  @Column({ default: 'Pendiente' })
  estado: 'Pendiente' | 'Pagado' | 'Vencido';

  @Column()
  metodoPago: string; // 'Tarjeta', 'Transferencia', 'Efectivo', etc.

  @Column('int')
  total: number;

  @CreateDateColumn()
  fechaEmision: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaPago: Date | null;

  // Recomendación: cambiar "productos" por "videosComprados"
  @Column('simple-json')
  videosComprados: {
    videoId: string;
    titulo: string;
    precio: number;
  }[];

  @Column({ default: false })
  eliminado: boolean;
}