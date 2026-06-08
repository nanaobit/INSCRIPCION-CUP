<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carrera extends Model
{
    protected $table = 'carrera';

    protected $fillable = [
        'nombre',
        'descripcion',
        'estado',
    ];

    protected $casts = [
        'estado' => 'boolean',
    ];

    public function cuposCarrera()
    {
        return $this->hasMany(CupoCarrera::class, 'id_carrera');
    }

    public function postulaciones()
    {
        return $this->hasMany(PostulaCarrera::class, 'id_carrera');
    }
}