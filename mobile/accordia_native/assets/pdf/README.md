# Modèle PDF repris du site

reference.jpg : octets exacts de server/reference-image.ts (1085×1536), sans réinterprétation ni agrandissement. C’est le modèle fourni déjà exploité par Accordia ; le fond français reste inchangé lorsque les annexes changent de langue.
web-regular.ttf : police regular exacte de server/pdf-fonts.ts (DejaVu Sans).
web-hand.ttf : police hand/Kalam de ce même module, décompressée de WOFF en TTF pour le moteur Flutter ; contours, caractères et avances inchangés et contrôlés via fontkit.
Licences des polices : assets/fonts/LICENSE.txt et docs/font-licenses/Kalam-OFL.txt.
Export développeur : node --experimental-strip-types scripts/export-native-reference.mjs depuis la racine web ; Python/fontTools nécessaires uniquement pour cette régénération. Le projet Android Studio contient déjà les ressources finales et n’utilise pas Python.
