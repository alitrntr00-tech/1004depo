 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/README.md b/README.md
index da14bc276410a736e3622781db1f3a45787d71ba..8e381a8222be6fd6093e71203f78f21c517b5b2b 100644
--- a/README.md
+++ b/README.md
@@ -1 +1,20 @@
-# 1004depo
\ No newline at end of file
+# 2D Uzay Savaşı
+
+Basit bir HTML5 canvas uzay savaşı oyunu. Sol/sağ tuşları ya da `A/D` ile gemiyi hareket ettirip boşluk tuşuyla lazer atabilirsiniz. Vurulan düşmanlar puan kazandırır, ekrana ulaşan veya çarpışan gemiler can götürür.
+
+## Çalıştırma
+1. Depoyu klonladıktan sonra dizine gidin.
+2. Yerel bir HTTP sunucusu ile dosyaları servis edin (örneğin `python -m http.server 8000`).
+3. Tarayıcıdan `http://localhost:8000` adresini açın.
+
+## Kontroller
+- Sol: `A` veya sol ok
+- Sağ: `D` veya sağ ok
+- Ateş: boşluk tuşu
+- Yeniden başlat: "Yeniden Başlat" düğmesi
+
+## Oynanış
+- Düşmanlar rastgele konum ve hızlarla ekranın üstünden belirir.
+- Mermiler düşmanlara temas ettiğinde hasar verir ve puan kazandırır.
+- Düşmanlar ekranın altına ulaşırsa veya gemiye çarparsa can kaybedersiniz.
+- Canlar bittiğinde oyun durur, yeniden başlat ile sıfırlanır.
 
EOF
)
