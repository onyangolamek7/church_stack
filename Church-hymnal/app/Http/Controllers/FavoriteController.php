<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Favorites;
use App\Models\Hymn;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->favorites()->with('hymn')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'hymn_id' => 'required|exists:hymns,id',
        ]);
       
        $request->user()->favorites()->create(['hymn_id' => $validated['hymn_id']]);
        return response()->json(['message' => 'Added to favorites'],201);
    }

    public function destroy(Request $request, Hymn $hymn)
    {
        $request->user()->favorites()->where('hymn_id', $hymn->id)->delete();
        return response()->json(['message' => 'Removed from favorites']);
    }

    public function toggleFavorite(Request $request, Hymn $hymn)
    {
        $favorite = $request->user()->favorites()->where('hymn_id', $hymn->id)->first();

        if ($favorite) {
            $request->user()->favorites()->detach('hymn_id', $hymn->id);
            return response()->json(['message' => 'Removed from favorites']);
        } else {
            $request->user()->favorites()->attach(['hymn_id' => $hymn->id]);
            return response()->json(['message' => 'Added to favorites'],201);
        }
    }

}
