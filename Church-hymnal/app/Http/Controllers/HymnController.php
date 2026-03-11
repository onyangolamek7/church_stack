<?php

namespace App\Http\Controllers;

use App\Models\Hymn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HymnController extends Controller
{
    //Get the hymns
    public function index(Request $request)
    {
        $query = Hymn::query();

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%')
                  ->orWhere('lyrics', 'like', '%' . $request->search . '%')
                  ->orWhere('number', 'like', '%' . $request->search . '%');
        }

        return $query->orderBy('number')->paginate(20);
    }

    //Store a new hymn in storage.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|integer|unique:hymns',
            'title' => 'required|string|max:255',
            'lyrics' => 'required|string',
        ]);

        $hymn = Hymn::create($validated);
        return response()->json($hymn, 201);
    }

    public function random() {
        return Hymn::inRandomOrder()->first();
    }

    //Display the specified hymn.
    public function show(string $id)
    {
        $hymn = Hymn::findOrFail($id);

        $isFavorite = false;

        $user = Auth::user();

        if ($user) {
            $isFavorite = $user()->favorites()
            ->where('hymn_id', $hymn->id)
            ->exists();
        }
        return response()->json(array_merge($hymn->toArray(), ['isFavorite' => $isFavorite]), 200);
    }

    //Update the specified hymn in storage.
    public function update(Request $request, $id)
    {
        $hymn = Hymn::findOrFail($id);
        $hymn->update($request->only([
            'number',
            'title',
            'lyrics'
        ]));
        return response()->json($hymn, 200);
    }

    //Deletes hymn from storage.
    public function destroy($id)
    {
        Hymn::findOrFail($id)->delete();
        return response()->json(['message' => 'Hymn deleted']);
    }
}
