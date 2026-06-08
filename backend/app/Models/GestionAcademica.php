<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GestionAcademica extends Model
{
    protected $table = 'gestion_academica';

    protected $fillable = [
        'nombre',
        'gestion',
        'periodo',
        'fecha_inicio',
        'fecha_fin',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
    ];

    public function postulantes()
    {
        return $this->hasMany(Postulante::class, 'id_gestion_academica');
    }

    public function cuposCarrera()
    {
        return $this->hasMany(CupoCarrera::class, 'id_gestion_academica');
    }
}