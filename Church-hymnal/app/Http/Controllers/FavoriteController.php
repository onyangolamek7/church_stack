<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Hymn;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->favorites()->with('hymn')->get());
    }

    public function store(Request $request, $hymnId)
    {
        $hymn = Hymn::findOrFail($hymnId);

        $already = $request->user()->favorites()
        ->where('hymn_id', $hymn->id)
        ->exists();
        if($already) {
            return response()->json(['message' => 'Already favorited'], 200);
        }

        $request->user()->favorites()->create(['hymn_id' => $hymn->id]);
        return response()->json(['message' => 'Added to favorites'],201);
    }

    public function destroy(Request $request, $hymnId)
    {
        $hymn = Hymn::findOrFail($hymnId);

        $request->user()->favorites()->where('hymn_id', $hymn->id)->delete();
        return response()->json(['message' => 'Removed from favorites']);
    }

}
