const request = require("supertest");
const mongoose = require("mongoose");
const User = require('../../models/userModels');
const app = require("../../app");
const Products = require("../../models/productsModels");

describe("Category Controller Tests", () => {
  let userId;

  beforeEach(async () => {
    // Limpeza
    await Products.deleteMany({});

    // Cria um usuário com produtos iniciais
    const product = await Products.create({
      userId: new mongoose.Types.ObjectId(),
      products: [
        { category: "Electronics", items: [] },
        { category: "Books", items: [] },
      ],
    });

    userId = product.userId;
  });

  describe("POST /category/:userId - createCategory", () => {
    it("should create a new category successfully", async () => {
      const response = await request(app)
        .post(`/api/category/${userId}`)
        .send({ userId, category: "Clothing" });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Categoria criada com sucesso");
      expect(response.body.category).toBe("Clothing");

      // Verifica se a categoria foi realmente salva no banco
      const updatedProduct = await Products.findOne({ userId });
      expect(updatedProduct.products.some(cat => cat.category === "Clothing")).toBe(true);
    });
    
    it("should return 404 if user is not found", async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/category/${invalidUserId}`)
        .send({ userId: invalidUserId, category: "Clothing" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Usuário não encontrado");
    });

    it("should return 400 if category already exists", async () => {
      const response = await request(app)
        .post(`/api/category/${userId}`)
        .send({ userId, category: "Electronics" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Categoria já existe");
    });
  });
  
  describe("GET /category/:userId - getCategories", () => {
    it("should return all categories for a user", async () => {
      const response = await request(app).get(`/api/category/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body.categories).toHaveLength(2);
      expect(response.body.categories[0].category).toBe("Electronics");
      expect(response.body.categories[1].category).toBe("Books");
    });

    it("should return 404 if user is not found", async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/category/${invalidUserId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Usuário não encontrado");
    });
  });

  describe("PUT /category/:userId - editCategory", () => {
    it("should edit an existing category successfully", async () => {
      const response = await request(app)
        .put(`/api/category/${userId}`)
        .send({ userId, oldCategory: "Electronics", newCategory: "Gadgets" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Categoria editada com sucesso");
      expect(response.body.updatedCategory).toBe("Gadgets");

      // Verifica se a categoria foi atualizada no banco
      const updatedProduct = await Products.findOne({ userId });
      expect(updatedProduct.products.some(cat => cat.category === "Gadgets")).toBe(true);
    });

    it("should return 404 if user is not found", async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/category/${invalidUserId}`)
        .send({ userId: invalidUserId, oldCategory: "Electronics", newCategory: "Gadgets" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Usuário não encontrado");
    });

    it("should return 404 if old category is not found", async () => {
      const response = await request(app)
        .put(`/api/category/${userId}`)
        .send({ userId, oldCategory: "Toys", newCategory: "Gadgets" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Categoria antiga não encontrada");
    });

    it("should return 400 if new category already exists", async () => {
      const response = await request(app)
        .put(`/api/category/${userId}`)
        .send({ userId, oldCategory: "Electronics", newCategory: "Books" });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("A nova categoria já existe");
    });
  });

  describe("DELETE /category/:userId/:category - deleteCategory", () => {
    it("should delete a category successfully", async () => {
      const response = await request(app).delete(`/api/category/${userId}/Electronics`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Categoria excluída com sucesso");

      // Verifica se a categoria foi removida do banco
      const updatedProduct = await Products.findOne({ userId });
      expect(updatedProduct.products.some(cat => cat.category === "Electronics")).toBe(false);
    });

    it("should return 404 if user is not found", async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/category/${invalidUserId}/Electronics`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Usuário não encontrado");
    });

    it("should return 404 if category is not found", async () => {
      const response = await request(app).delete(`/api/category/${userId}/Toys`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Categoria não encontrada");
    });
    
  });
  
});