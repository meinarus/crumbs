"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { RecipeCard } from "./recipe-card";
import type { RecipeWithItems } from "@/actions/recipes";

type RecipesListProps = {
  recipes: RecipeWithItems[];
};

export function RecipesList({ recipes }: RecipesListProps) {
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(() => {
    if (!search.trim()) return recipes;

    const query = search.toLowerCase();
    return recipes.filter((recipe) =>
      recipe.name.toLowerCase().includes(query),
    );
  }, [recipes, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filteredRecipes.length === 0 ? (
        <div className="border-muted-foreground/25 flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {recipes.length === 0
              ? "No recipes yet. Create your first recipe!"
              : "No recipes match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
