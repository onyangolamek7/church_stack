<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sermons', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('preacher')->nullable();
            $table->text('description')->nullable();
            
            $table->dateTime('service_date');

            $table->longText('content')->nullable(); //sermon notes
            $table->string('audio_url')->nullable();
            $table->string('video_url')->nullable();

            $table->enum('status', ['upcoming', 'completed'])->default('upcoming');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sermons');
    }
};
