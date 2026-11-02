// Suggestions only: the report keeps its original free-text make/model field.
// Includes older brands and commercial makes so existing reports stay editable.
export const vehicleBrands=[
 'Abarth','Acura','Aiways','Aixam','Alfa Romeo','Alpine','Aston Martin','Audi','Austin',
 'BAIC','Bentley','BMW','Borgward','Bugatti','Buick','BYD',
 'Cadillac','Caterham','Changan','Chery','Chevrolet','Chrysler','Citroën','Cupra',
 'Dacia','Daewoo','DAF','Daihatsu','Datsun','Denza','DFSK','Dodge','Dongfeng','Donkervoort','DR','DS Automobiles',
 'Ebro','Elaris','EVO','Ferrari','Fiat','Fisker','Ford','Foton',
 'GAC','Geely','Genesis','GMC','GWM',
 'Haima','Haval','Honda','Hongqi','Hummer','Hyundai',
 'Ineos','Infiniti','Isuzu','Iveco',
 'Jaecoo','Jaguar','Jeep','Jetour',
 'KGM','Kia','Koenigsegg',
 'Lada','Lamborghini','Lancia','Land Rover','Leapmotor','Lexus','Li Auto','Ligier','Lincoln','Lotus','Lucid','Lynk & Co',
 'MAN','Mahindra','Maserati','Maxus','Maybach','Mazda','McLaren','Mercedes-Benz','MG','Microcar','MINI','Mitsubishi','Morgan',
 'Neta','Nio','Nissan',
 'Oldsmobile','Omoda','Opel','Ora',
 'Pagani','Peugeot','Piaggio','Plymouth','Polestar','Pontiac','Porsche','Proton',
 'Ram','Renault','Renault Trucks','Rimac','Rivian','Rolls-Royce','Rover',
 'Saab','Santana','Saturn','Scania','SEAT','Seres','Škoda','Smart','SsangYong','Subaru','Suzuki','SWM',
 'Tata','Tesla','Toyota','TVR',
 'UAZ','Vauxhall','VinFast','Volkswagen','Volvo','Voyah','Wartburg','Wey','Wiesmann','Wuling','XPeng','Zastava','Zeekr'
].sort((a,b)=>a.localeCompare(b,'fr',{sensitivity:'base'}));
export const brandCopy={
 fr:'marques proposées. Choisissez une marque, puis utilisez « Saisir ou préciser ma réponse » pour ajouter le modèle ou une marque absente. La saisie libre reste disponible.',
 en:'suggested makes. Choose a make, then use “Enter or refine my answer” to add the model or a missing make. Free entry remains available.',
 de:'Markenvorschläge. Marke wählen und mit „Antwort eingeben oder ergänzen“ Modell oder fehlende Marke eintragen. Freitext bleibt verfügbar.',
 nl:'voorgestelde merken. Kies een merk en gebruik “Mijn antwoord invullen of aanvullen” om het model of een ontbrekend merk toe te voegen. Vrije invoer blijft beschikbaar.'
};
