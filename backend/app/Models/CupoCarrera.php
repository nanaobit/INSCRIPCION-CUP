<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CupoCarrera extends Model
{
    protected $table = 'cupo_carrera';

    protected $fillable = [
        'id_gestion_academica',
        'id_carrera',
        'cantidad_cupos',
        'cupos_disponibles',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function gestionAcademica()
    {
        return $this->belongsTo(GestionAcademica::class, 'id_gestion_academica');
    }

    public function carrera()
    {
        return $this->belongsTo(Carrera::class, 'id_carrera');
    }
}