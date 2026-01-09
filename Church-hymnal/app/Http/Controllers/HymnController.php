<?php

namespace App\Http\Controllers;

use App\Models\Hymn;
use Illuminate\Http\Request;

class HymnController extends Controller
{
    //Get the hymns
    public function index()
    {
        return response()->json(Hymn::all(), 200);
    }

    //Store a new hymn in storage.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'lyrics' => 'required|string',
        ]);

        $hymn = Hymn::create($validated);
        return response()->json($hymn, 201);
    }

    //Display the specified hymn.
    public function show(string $id)
    {
        return response()->json(Hymn::findOrFail($id), 200);
    }

    //Update the specified hymn in storage.
    public function update(Request $request, string $id)
    {
        $hymn = Hymn::findOrFail($id);
        $hymn->update($request->all());
        return response()->json($hymn, 200);
    }

    //Deletes hymn from storage.
    public function destroy(string $id)
    {
        Hymn::findOrFail($id)->delete();
        return response()->json(['message' => 'Hymn deleted']);
    }
}
