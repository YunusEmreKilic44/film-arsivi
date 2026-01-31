const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const file = require("node:fs");
const { readFromFile, writeToFile } = require("./modules/fileManager");
const event = require("./modules/eventBus");

// readFromFile("films.json");
// writeToFile("films.json", { id: 6, title: "Inception 7" });

console.log(process.cwd());

(async () => {
  const { logger } = await import("./modules/logger.mjs");
  const renderTemplate = async (file, vars = {}) => {
    let html = await fs.readFile(
      path.join(__dirname, "templates", file),
      "utf-8",
    );

    for (const key in vars) {
      html = html.replaceAll(`{{${key}}}`, vars[key]);
    }
    return html;
  };

  const server = http.createServer(async (req, res) => {
    logger.info(`${req.method} ${req.url}`);

    try {
      if (req.url === "/") {
        const { films } = await readFromFile("films.json");

        const watched = films.filter((film) => film.watched);
        const avg =
          films.length === 0
            ? 0
            : films.reduce((acc, f) => acc + f.rating, 0) / films.length;

        const lastFilms = films
          .slice(-3)
          .map((f) => `<li>${f.title} (${f.year})</li>`)
          .join("");

        const html = `
    <h1>Ana Sayfa</h1>
    <p>
      Toplam Film: ${films.length}<br>
      İzlenen: ${watched.length}<br>
      Ortalama Puan: ${avg.toFixed(1)}
    </p>
    <ul>${lastFilms}</ul>
  `;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(html);
      } else if (req.url === "/films") {
        const { films } = await readFromFile("films.json");

        const list = films
          .map(
            (f) => `
      <div>
        <h3>${f.title}</h3>
        <p>${f.year} | ⭐ ${f.rating}</p>
        <a href="/films/${f.id}">Detay</a>
      </div>
      `,
          )
          .join("");

        const html = await renderTemplate("films.html", {
          title: "Filmler",
          filmList: list,
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      } else if (req.url.startsWith("/films/")) {
        const id = Number(req.url.split("/")[2]);
        const { films } = await readFromFile("films.json");
        const film = films.find((f) => f.id === id);

        if (!film) throw new Error("Film bulunamadi");
        event.emit("filmViewed", film);

        const html = await renderTemplate("film-detail.html", {
          title: film.title,
          content: `
            Yönetmen: ${film.director}<br>
            Kategori: ${film.category}<br>
            Puan: ${film.rating}<br>
            Durum: ${film.watched ? "✓ İzlenmiş" : "✗ İzlenmemiş"}
          `,
        });
        res.end(html);
      } else if (req.url === "/api/films") {
        const data = await readFromFile("films.json");
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      } else if (req.url === "/api/stats") {
        const { films } = await readFromFile("films.json");

        const totalFilms = films.length;
        const watchedFilms = films.filter((f) => f.watched).length;

        const avgRating =
          films.reduce((acc, f) => acc + f.rating, 0) / totalFilms;

        const categories = {};
        films.forEach(
          (film) =>
            (categories[film.category] = (categories[film.category] || 0) + 1),
        );

        const stats = {
          totalFilms,
          watchedFilms,
          avgRating: Number(avgRating.toFixed(2)),
          categories,
        };
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(stats));
      } else if (req.url === "/reports/export") {
        const { films } = await readFromFile("films.json");
        const filePath = path.join(__dirname, "reports", "films-export.txt");

        const stream = file.createWriteStream(filePath);
        stream.write("=== Film Arşivi Raporu ===\n");

        films.forEach((f, i) => {
          stream.write(`${i + 1}. ${f.title} (${f.year})\n`);
        });
        stream.end(() => {
          event.emit("reportGenerated", "films-export.txt");
        });
        res.end("Rapor olusturuldu");
      } else {
        res.statusCode = 404;
        res.end(await renderTemplate("404.html"));
      }
    } catch (err) {
      logger.error(err.message);
      res.statusCode = 500;
      res.end("Sunucu hatası");
    }
  });

  server.listen(3000, () => {
    logger.info("Server started on port 3000");
  });
})();
