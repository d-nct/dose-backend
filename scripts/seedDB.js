require('dotenv').config({ path: './.env' });
const connectDB = require('../src/config/db');
const Usuario = require('../src/models/Usuario');
const Categoria = require('../src/models/Categoria');
const Drink = require('../src/models/Drink');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log('Clearing existing data...');
    await Usuario.deleteMany({});
    await Categoria.deleteMany({});
    await Drink.deleteMany({});
    console.log('Existing data cleared.');

    // 1. Create an owner user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('changeme', salt); // Mockup password
    const ownerUser = new Usuario({
      nome_usuario: 'daniel',
      hash_senha: hashedPassword,
      credencial: 3,
    });
    await ownerUser.save();
    console.log(`Owner user created: ${ownerUser.email} with credential ${ownerUser.credencial}`);

    // 2. Create IBA drink categories
    const ibaCategoriesData = [
      {
        nome: "IBA - Inesquecíveis",
        descricao: "Os atemporais que definem a essência da coquetelaria.",
      },
      {
        nome: "IBA - Clássicos Contemporâneos",
        descricao:
          "Bebidas que conquistaram seu lugar no panteão dos coquitéis. São os clássicos que viraram ícones.",
      },
      {
        nome: "IBA - Nova Era",
        descricao:
          "São a vanguarda da coquetelaria. Representam a criatividade e inovação sobre sabores e técnicas.",
      },
    ];

    const createdCategories = [];
    for (const catData of ibaCategoriesData) {
      const category = new Categoria(catData);
      await category.save();
      createdCategories.push(category);
      console.log(`Category created: '${category.nome}'`);
    }

    // 3. Create IBA drinks from CSV string
    const ibaDrinksCSV = `
nome;descricao;categoria
Alexander;Um coquetel clássico, cremoso e doce, com conhaque, crème de cacao escuro e creme de leite.;IBA - Inesquecíveis
Americano;Um aperitivo italiano refrescante, com Campari, vermute doce e um toque de água com gás.;IBA - Inesquecíveis
Angel Face;Um coquetel clássico e equilibrado, com gin, brandy de damasco e calvados.;IBA - Inesquecíveis
Aviation;Um coquetel clássico e floral, com gin, licor maraschino, crème de violette e suco de limão.;IBA - Inesquecíveis
Between the Sheets;Um coquetel potente e azedo, semelhante ao Sidecar, mas com a adição de rum branco.;IBA - Inesquecíveis
Boulevardier;Uma variação do Negroni, que substitui o gin por uísque bourbon ou de centeio.;IBA - Inesquecíveis
Brandy Crusta;Um coquetel clássico de Nova Orleans, precursor do Sidecar, com conhaque, licor maraschino, curaçao, suco de limão e bitters.;IBA - Inesquecíveis
Casino;Um coquetel clássico e seco, com gin Old Tom, licor maraschino, bitters de laranja e suco de limão.;IBA - Inesquecíveis
Clover Club;Um coquetel clássico pré-Lei Seca, com gin, suco de limão, xarope de framboesa e clara de ovo.;IBA - Inesquecíveis
Daiquiri;Um coquetel cubano clássico e simples, com rum, suco de limão e açúcar.;IBA - Inesquecíveis
Dry Martini;O coquetel por excelência, feito com gin e vermute seco, guarnecido com uma azeitona ou uma casca de limão.;IBA - Inesquecíveis
Gin Fizz;Um coquetel clássico e refrescante, com gin, suco de limão, açúcar e água com gás.;IBA - Inesquecíveis
Hanky Panky;Um coquetel clássico com um toque de amargor, com gin, vermute doce e Fernet-Branca.;IBA - Inesquecíveis
John Collins;Um coquetel alto e refrescante, semelhante ao Tom Collins, mas que pode ser feito com uísque bourbon.;IBA - Inesquecíveis
Last word;Um coquetel potente e complexo da era da Lei Seca, com partes iguais de gin, Chartreuse verde, licor maraschino e suco de limão.;IBA - Inesquecíveis
Manhattan;Um coquetel clássico e sofisticado, com uísque, vermute doce e angostura bitters.;IBA - Inesquecíveis
Martinez;O precursor do Dry Martini, um coquetel mais doce com gin Old Tom, vermute doce, licor maraschino e bitters.;IBA - Inesquecíveis
Mary Pickford;Um coquetel da era da Lei Seca, doce e tropical, com rum branco, suco de abacaxi, grenadine e licor maraschino.;IBA - Inesquecíveis
Monkey Gland;Um coquetel incomum da era da Lei Seca, com gin, suco de laranja, absinto e grenadine.;IBA - Inesquecíveis
Negroni;Um aperitivo italiano icônico e amargo, com partes iguais de gin, Campari e vermute doce.;IBA - Inesquecíveis
Old Fashioned;Um dos coquetéis mais antigos, feito lentamente misturando açúcar com bitters e água, adicionando uísque e uma rodela de cítricos.;IBA - Inesquecíveis
Paradise;Um coquetel clássico e simples, com gin, brandy de damasco e suco de laranja.;IBA - Inesquecíveis
Planter's Punch;Um coquetel clássico de rum jamaicano, com uma receita que varia, mas geralmente inclui rum escuro, sucos de frutas cítricas, açúcar e bitters.;IBA - Inesquecíveis
Porto Flip;Um coquetel cremoso e rico, semelhante a uma sobremesa, com vinho do Porto, conhaque e gema de ovo.;IBA - Inesquecíveis
Ramos Fizz;Um coquetel clássico de Nova Orleans, famoso por sua textura cremosa e espumosa, com gin, suco de limão e lima, clara de ovo, açúcar, creme, água de flor de laranjeira e água com gás.;IBA - Inesquecíveis
Rusty Nail;Um coquetel escocês simples e potente, com uísque escocês e Drambuie.;IBA - Inesquecíveis
Sazerac;O coquetel oficial de Nova Orleans, uma variação do Old Fashioned com uísque de centeio, absinto, Peychaud's bitters e um cubo de açúcar.;IBA - Inesquecíveis
Sidecar;Um coquetel clássico e equilibrado, com conhaque, licor de laranja e suco de limão.;IBA - Inesquecíveis
Stinger;Um dueto simples e potente, com conhaque e crème de menthe branco.;IBA - Inesquecíveis
Tuxedo;Um coquetel clássico complexo, semelhante a um Martini, mas com a adição de licor maraschino, absinto e bitters de laranja.;IBA - Inesquecíveis
Vieux Carrè;Um coquetel clássico de Nova Orleans, complexo e rico, com uísque de centeio, conhaque, vermute doce, Bénédictine e bitters.;IBA - Inesquecíveis
Whiskey Sour;Um coquetel clássico e atemporal, com uísque, suco de limão, açúcar e, opcionalmente, clara de ovo.;IBA - Inesquecíveis
White Lady;Um coquetel clássico elegante e cítrico, com gin, licor de laranja e suco de limão fresco.;IBA - Inesquecíveis
Bellini;Um coquetel elegante e refrescante de Veneza, feito com purê de pêssego branco e Prosecco.;IBA - Clássicos Contemporâneos
Black Russian;Um coquetel simples e potente, com vodka e licor de café servido com gelo.;IBA - Clássicos Contemporâneos
Bloody Mary;Um coquetel clássico e saboroso, conhecido por sua combinação de vodka, suco de tomate e uma variedade de especiarias e temperos.;IBA - Clássicos Contemporâneos
Caipirinha;A bebida nacional do Brasil, uma mistura refrescante de cachaça, limão taiti, açúcar e gelo.;IBA - Clássicos Contemporâneos
Champagne Cocktail;Um coquetel sofisticado e festivo, que combina champagne, conhaque, angostura e um cubo de açúcar.;IBA - Clássicos Contemporâneos
Corpse Reviver #2;Um coquetel potente e cítrico da era da Lei Seca, com gin, Lillet Blanc, cointreau, suco de limão e um toque de absinto.;IBA - Clássicos Contemporâneos
Cosmopolitan;Um coquetel moderno e popular, com vodka citron, cointreau, suco de cranberry e suco de limão.;IBA - Clássicos Contemporâneos
Cuba Libre;Um coquetel cubano icônico e simples, feito com rum, cola e um toque de suco de limão.;IBA - Clássicos Contemporâneos
French 75;Um coquetel clássico e elegante, que combina gin, champagne, suco de limão e açúcar.;IBA - Clássicos Contemporâneos
French Connection;Um coquetel simples e sofisticado, com partes iguais de conhaque e licor de amêndoa amaretto.;IBA - Clássicos Contemporâneos
Golden Dream;Um coquetel cremoso e doce, com licor Galliano, Cointreau, suco de laranja e creme de leite.;IBA - Clássicos Contemporâneos
Grasshopper;Um coquetel doce e mentolado, com creme de menta verde, creme de cacau branco e creme de leite.;IBA - Clássicos Contemporâneos
Hemingway Special;Uma variação do Daiquiri, com rum, licor maraschino, suco de toranja e suco de limão, sem açúcar.;IBA - Clássicos Contemporâneos
Horse's Neck;Um coquetel refrescante e simples, feito com conhaque (ou bourbon) e ginger ale, guarnecido com uma longa casca de limão.;IBA - Clássicos Contemporâneos
Irish Coffee;Uma bebida quente e reconfortante, que combina café quente, uísque irlandês, açúcar e uma camada de creme.;IBA - Clássicos Contemporâneos
KIR;Um aperitivo francês clássico e simples, feito com vinho branco seco e crème de cassis.;IBA - Clássicos Contemporâneos
Long Island Ice Tea;Um coquetel potente com uma mistura de vodka, gin, rum, tequila, triple sec, suco de limão e um toque de cola.;IBA - Clássicos Contemporâneos
Mai-Tai;Um coquetel tropical complexo e frutado, com rum, licor de laranja, xarope de amêndoa (orgeat) e suco de limão.;IBA - Clássicos Contemporâneos
Margarita;O coquetel mais popular à base de tequila, combinando tequila, licor de laranja e suco de limão, servido com sal na borda do copo.;IBA - Clássicos Contemporâneos
Mimosa;Um coquetel leve e festivo para brunch, feito com partes iguais de champagne e suco de laranja.;IBA - Clássicos Contemporâneos
Mint Julep;Um coquetel clássico do sul dos Estados Unidos, com bourbon, hortelã fresca, açúcar e água.;IBA - Clássicos Contemporâneos
Mojito;Um coquetel cubano refrescante e popular, feito com rum, hortelã, suco de limão, açúcar e água com gás.;IBA - Clássicos Contemporâneos
Moscow Mule;Um coquetel picante e refrescante, servido em uma caneca de cobre, com vodka, cerveja de gengibre e suco de limão.;IBA - Clássicos Contemporâneos
Pina Colada;Um coquetel tropical cremoso e doce de Porto Rico, com rum, creme de coco e suco de abacaxi.;IBA - Clássicos Contemporâneos
Pisco Sour;A bebida nacional do Peru, um coquetel azedo e espumoso com pisco, suco de limão, xarope de açúcar e clara de ovo.;IBA - Clássicos Contemporâneos
Sea Breeze;Um coquetel refrescante e frutado, com vodka, suco de cranberry e suco de toranja.;IBA - Clássicos Contemporâneos
Sex on the Beach;Um coquetel frutado e popular, com vodka, licor de pêssego, suco de laranja e suco de cranberry.;IBA - Clássicos Contemporâneos
Singapore Sling;Um coquetel complexo e tropical de Singapura, com gin, licor de cereja, Cointreau, Bénédictine, suco de abacaxi, suco de limão, grenadine e angostura.;IBA - Clássicos Contemporâneos
Tequila Sunrise;Um coquetel visualmente atraente que se assemelha a um nascer do sol, com tequila, suco de laranja e um toque de grenadine.;IBA - Clássicos Contemporâneos
Vesper;Um coquetel clássico de James Bond, com gin, vodka e Lillet Blanc.;IBA - Clássicos Contemporâneos
Zombie;Um coquetel tiki extremamente potente, com uma mistura de diferentes tipos de rum, licores de frutas e sucos.;IBA - Clássicos Contemporâneos
Barracuda;Um coquetel tropical e refrescante, com rum dourado, Galliano, suco de abacaxi, suco de limão e um toque de Prosecco.;IBA - Nova Era
Bee's Knees;Um coquetel da era da Lei Seca, com gin, suco de limão fresco e mel.;IBA - Nova Era
Bramble;Um coquetel moderno e frutado, com gin, suco de limão, xarope de açúcar e um fio de licor de amora.;IBA - Nova Era
Canchanchara;Um coquetel cubano rústico e refrescante, com aguardente, mel e suco de limão.;IBA - Nova Era
Dark n stormy;Um coquetel simples e picante de Bermudas, com rum escuro e cerveja de gengibre.;IBA - Nova Era
Espresso Martini;Um coquetel sofisticado e energizante, com vodka, licor de café e café expresso fresco.;IBA - Nova Era
Fernandito;Um coquetel popular argentino, com Fernet-Branca e Coca-Cola.;IBA - Nova Era
French Martini;Um coquetel frutado e elegante, com vodka, licor de framboesa e suco de abacaxi.;IBA - Nova Era
Illegal;Um coquetel moderno com mezcal, rum branco overproof, falernum, licor maraschino, suco de limão e clara de ovo.;IBA - Nova Era
Lemon drop Martini;Um coquetel doce e azedo com sabor de bala de limão, feito com vodka citron, suco de limão e açúcar.;IBA - Nova Era
Naked and Famous;Um coquetel moderno e equilibrado, com partes iguais de mezcal, Chartreuse amarelo, Aperol e suco de limão.;IBA - Nova Era
New York Sour;Um Whiskey Sour clássico com um toque final, uma camada de vinho tinto seco flutuando no topo.;IBA - Nova Era
Old Cuban;Um coquetel moderno que combina elementos do Mojito e do French 75, com rum envelhecido, hortelã, suco de limão, xarope de açúcar, angostura e champagne.;IBA - Nova Era
Paloma;Um coquetel mexicano refrescante e popular, com tequila e refrigerante de toranja.;IBA - Nova Era
Paper Plane;Um coquetel moderno e agridoce, com partes iguais de bourbon, Aperol, Amaro Nonino e suco de limão.;IBA - Nova Era
Penicillin;Um coquetel moderno com sabor defumado e picante, com uísque escocês, uísque escocês de Islay, xarope de mel e gengibre e suco de limão.;IBA - Nova Era
Russian Spring Punch;Um coquetel refrescante e frutado, com vodka, crème de cassis, suco de limão e espumante.;IBA - Nova Era
Southside;Um coquetel refrescante da era da Lei Seca, semelhante a um Mojito com gin, com gin, suco de limão, xarope de açúcar e hortelã.;IBA - Nova Era
Spicy Fifty;Um coquetel moderno e picante, com vodka, licor de flor de sabugueiro, mel, pimenta vermelha fresca e suco de limão.;IBA - Nova Era
Spritz;Um aperitivo italiano refrescante e popular, com Prosecco, um bitter como Aperol ou Campari e um toque de água com gás.;IBA - Nova Era
Suffering Bastard;Um coquetel clássico com gin, conhaque, suco de limão, angostura e cerveja de gengibre, criado para curar ressacas.;IBA - Nova Era
Tipperary;Um coquetel clássico irlandês, com uísque irlandês, vermute tinto doce e Chartreuse verde.;IBA - Nova Era
Tommy's Margarita;Uma variação moderna da Margarita, que substitui o licor de laranja por néctar de agave.;IBA - Nova Era
Trinidad Sour;Um coquetel incomum e ousado, com uma grande quantidade de Angostura bitters como base, além de uísque de centeio, orgeat e suco de limão.;IBA - Nova Era
VE.N.TO;Um coquetel italiano moderno, com grappa, licor de camomila, mel, suco de limão e clara de ovo.;IBA - Nova Era
Yellow Bird;Um coquetel tropical e frutado, com rum branco, Galliano, triple sec e suco de limão.;IBA - Nova Era
`;

    const parseCSV = (csvString) => {
      const lines = csvString.trim().split('\n');
      const headers = lines[0].split(';');
      return lines.slice(1).map(line => {
        const values = line.split(';');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index].trim();
          return obj;
        }, {});
      });
    };

    const drinksData = parseCSV(ibaDrinksCSV);

    for (const drinkData of drinksData) {
    //   console.log(drinkData);
      console.log(`Attempting to find category for drink '${drinkData.nome}'. Looking for category name: '${drinkData.categoria}'`);
      const category = createdCategories.find(c => c.nome === drinkData.categoria);
      if (category) {
        const drink = new Drink({
          nome: drinkData.nome,
          descricao: drinkData.descricao,
          // imagem: 'default.jpg', // You might want to add a default image or handle this
          usuario: ownerUser._id,
          categoria: category._id,
        });
        await drink.save();
        console.log(`Drink created: ${drink.nome} in category ${category.nome}`);
      } else {
        console.warn(`Category not found for drink: ${drinkData.nome} (Category looked for: '${drinkData.categoria}')`);
      }
    }

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
