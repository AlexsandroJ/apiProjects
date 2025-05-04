const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app"); // Certifique-se de que seu servidor esteja configurado corretamente
const Products = require("../../models/productsModels");

describe("Testes para o controlador de itens", () => {
  let userId, category, name;

  beforeAll(async () => {
    userId = new mongoose.Types.ObjectId();
    category = "eletrônicos";
    name = "smartphone";

    // Criar um produto fictício no banco de dados para ser usado nos testes
    const product = await Products.create({
      userId,
      products: [
        {
          category,
          items: [
            {
              _id: new mongoose.Types.ObjectId(),
              name: "smartphone",
              type: "Celular",
              price: 1000,
              description: "Um smartphone top de linha",
              available: true,
              image: "smartphone.jpg",
              stock: 10,
            },
          ],
        },
      ],
    });

  });


  describe("POST /items/:userId/:category", () => {
    it("deve criar um novo item em uma categoria específica", async () => {
      const res = await request(app)
        .post(`/api/items/${userId}/${category}`)
        .send({
          name: "Notebook",
          type: "Computador",
          price: 3000,
          description: "Um notebook gamer",
          available: true,
          image: "notebook.jpg",
          stock: 5,
        });
  
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Item criado com sucesso");
      expect(res.body.item.name).toBe("notebook");
    });

    it("não deve criar um item se a categoria não existir", async () => {
      const res = await request(app)
        .post(`/api/items/${userId}/Roupas`)
        .send({
          name: "Camiseta",
          type: "Vestuário",
          price: 50,
          description: "Uma camiseta básica",
          available: true,
          image: "camiseta.jpg",
          stock: 20,
        });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Categoria não encontrada");
    });
  });
  
  describe("GET /items/:userId/:category", () => {
    it("deve retornar todos os itens de uma categoria específica", async () => {
      const res = await request(app).get(`/api/items/${userId}/${category}`);

      expect(res.statusCode).toBe(200);
      //expect(res.body.items.length).toBe(1);
      expect(res.body.items[0].name).toBe("smartphone");
    });

    it("não deve retornar itens se a categoria não existir", async () => {
      const res = await request(app).get(`/api/items/${userId}/Roupas`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Categoria não encontrada");
    });
  });
  
  describe("PUT /items/:userId/:category/:name", () => {
    it("deve atualizar um item específico", async () => {
      const res = await request(app)
        .put(`/api/items/${userId}/${category}/${name}`)
        .send({ price: 900, stock: 5 });

        expect(res.body.message).toBe("Item atualizado com sucesso");
      expect(res.statusCode).toBe(200);
      
      expect(res.body.item.price).toBe(900);
      expect(res.body.item.stock).toBe(5);
    });

    it("não deve atualizar um item se ele não existir", async () => {
      const res = await request(app)
        .put(`/api/items/${userId}/${category}/Notebook`)
        .send({ price: 1500 });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Item não encontrado");
    });
  });

  describe("DELETE /items/:userId/:category/:name", () => {
    it("deve excluir um item específico", async () => {
      const res = await request(app).delete(`/api/items/${userId}/${category}/${name}`);
      
      expect(res.body.message).toBe("Item excluído com sucesso");
      expect(res.statusCode).toBe(200);
      
    });

    it("não deve excluir um item se ele não existir", async () => {
      const res = await request(app).delete(`/api/items/${userId}/${category}/Notebook`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Item não encontrado");
    });
  });
  
});