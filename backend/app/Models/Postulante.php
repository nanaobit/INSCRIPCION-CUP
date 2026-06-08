<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Postulante extends Model
{
    protected $table = 'postulante';

    protected $fillable = [
        'id_usuario',
        'id_gestion_academica',
        'nro_registro',
        'colegio_procedencia',
        'ciudad',
        'estado_requisitos',
        'estado_pago',
        'estado_academico',
        'estado_admision',
        'promedio_final',
        'fecha_registro',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
        'fecha_registro' => 'datetime',
        'promedio_final' => 'decimal:2',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function gestionAcademica()
    {
        return $this->belongsTo(GestionAcademica::class, 'id_gestion_academica');
    }

    public function requisito()
    {
        return $this->hasOne(RequisitoPostulante::class, 'id_postulante');
    }

    public function carrerasPostuladas()
    {
        return $this->hasMany(PostulaCarrera::class, 'id_postulante');
    }
}