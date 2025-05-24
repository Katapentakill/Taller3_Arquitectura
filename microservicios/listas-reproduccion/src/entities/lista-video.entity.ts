import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ListaReproduccion } from './lista-reproduccion.entity';

@Entity()
export class ListaVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ListaReproduccion, (lista) => lista.videos)
  @JoinColumn({ name: 'listaId' })
  lista: ListaReproduccion;

  @Column()
  videoId: string;
}