import express  from "express";
import "dotenv/config";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js"
import { favoritesTables } from "./db/schema.js";
import { and, eq } from "drizzle-orm";


const app = express()
const PORT = ENV.PORT || 5001

app.use(express.json())

app.get("/api/health", (req,res) => {
    res.status(200).json({success: true })
})

app.post("/api/favorites", async (req, res) => {

    try {
      const { userId, recipeId, title, image, cookTime, servings } = req.body;

      if(!userId || !recipeId || !title){
        return res.status(400).json({ error: "Missing required failed" });
      }

      const newFavorite = await db.insert(favoritesTables).values({
        userId,
        recipeId,
        title,
        image,
        cookTime,
        servings,
      }).returning();

      res.status(201).json(newFavorite[0])
    } catch (error) {
        console.log("Error adding favorite", error)
        res.status(500).json({error:"Something went wrong"})
    }
})

app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const {userId} = req.params;

      const userFavorites = await db.select().from(favoritesTables).where(eq(favoritesTables.userId, userId))

      res.status(200).json(userFavorites);


    } catch (error) {
        console.log("Error fetching the favorites", error)
        res.status(500).json({error:"Something went wrong"})
    }
})

app.delete("/api/favorites/:userId/:recipeId", async (req,res) => {
    try {
        const {userId, recipeId } = req.params;

        await db.delete(favoritesTables).where(
            and(eq(favoritesTables.userId, userId), eq(favoritesTables.recipeId, parseInt(recipeId)))
        )

        res.status(200).json({ message: "Favorite removed good" })
    } catch (error) {
        console.log("Error removing a favorite", error)
        res.status(500).json({error:"Something went wrong"})
    }
})

app.listen(PORT, () => {
    console.log("Server is runnin on PORT:", PORT);
});