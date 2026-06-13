/**
 * IBAN data for all 27 EU countries.
 *
 * Each country defines:
 *   name         — Country name
 *   ibanLength   — Total IBAN length (country code 2 + check digits 2 + BBAN)
 *   currency     — Default currency
 *   bban         — Array of BBAN field descriptors. Fields with "bank" type pull
 *                  from the bank entry. "branch" and "account" are randomly generated.
 *   banks        — Array of { bic, name, code } where code is the bank-specific
 *                  identifier that goes in the "bank" BBAN field(s).
 *
 * BIC: 8-char format (bank code 4 + country 2 + location 2).
 */

export const COUNTRIES = {
  AT: {
    name: "Austria",
    ibanLength: 20,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 5 },
      { type: "account", label: "Account Number", length: 11 },
    ],
    banks: [
      { bic: "GIBAATWW", name: "Erste Bank", code: "20111" },
      { bic: "RZOOAT2L", name: "Raiffeisen Bank", code: "32000" },
      { bic: "BKAUATWW", name: "Bank Austria", code: "12000" },
      { bic: "OBKLAT2L", name: "Oberbank", code: "15100" },
      { bic: "HYPNATWW", name: "Hypo Tirol Bank", code: "57000" },
    ],
  },
  BE: {
    name: "Belgium",
    ibanLength: 16,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 3 },
      { type: "account", label: "Account Number", length: 7 },
      { type: "nationalCheck", label: "Check Digits", length: 2 },
    ],
    banks: [
      { bic: "KBCBBEBB", name: "KBC Bank", code: "734" },
      { bic: "GEBABEBB", name: "BNP Paribas Fortis", code: "001" },
      { bic: "BBRUBEBB", name: "ING Belgium", code: "630" },
      { bic: "GKCCBEBB", name: "Belfius", code: "068" },
      { bic: "AXABBE22", name: "AXA Bank Belgium", code: "751" },
    ],
  },
  BG: {
    name: "Bulgaria",
    ibanLength: 22,
    currency: "BGN",
    bban: [
      { type: "bank", label: "BIC Bank Code", length: 4 },
      { type: "branch", label: "Branch", length: 4 },
      { type: "account", label: "Account Number", length: 10 },
    ],
    banks: [
      { bic: "UNCRBGSF", name: "UniCredit Bulbank", code: "UNCR" },
      { bic: "STSABGSF", name: "DSK Bank", code: "STSA" },
      { bic: "FINVBGSF", name: "First Investment Bank", code: "FINV" },
      { bic: "BPBIBGSF", name: "Postbank", code: "BPBI" },
      { bic: "RZBBBGSF", name: "Raiffeisenbank Bulgaria", code: "RZBB" },
    ],
  },
  HR: {
    name: "Croatia",
    ibanLength: 21,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 7 },
      { type: "account", label: "Account Number", length: 10 },
    ],
    banks: [
      { bic: "ZABAHR2X", name: "Zagrebačka Banka", code: "2360000" },
      { bic: "PBZGHR2X", name: "Privredna Banka Zagreb", code: "2340009" },
      { bic: "RBIHHR2X", name: "Raiffeisenbank Austria", code: "2484000" },
      { bic: "ESBCHR22", name: "Erste & Steiermärkische Bank", code: "2402000" },
      { bic: "HPBZHR2X", name: "Hrvatska Poštanska Banka", code: "2390001" },
    ],
  },
  CY: {
    name: "Cyprus",
    ibanLength: 28,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 3 },
      { type: "branch", label: "Branch", length: 5 },
      { type: "account", label: "Account Number", length: 16 },
    ],
    banks: [
      { bic: "BCYPCY2N", name: "Bank of Cyprus", code: "002" },
      { bic: "HEKBCY2N", name: "Hellenic Bank", code: "003" },
      { bic: "ABKLCY2N", name: "Ancoria Bank", code: "005" },
      { bic: "RCFGCY2N", name: "Eurobank Cyprus", code: "012" },
      { bic: "ASTICY2N", name: "AstroBank", code: "004" },
    ],
  },
  CZ: {
    name: "Czech Republic",
    ibanLength: 24,
    currency: "CZK",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "prefix", label: "Prefix", length: 6 },
      { type: "account", label: "Account Number", length: 10 },
    ],
    banks: [
      { bic: "KOMBCZPP", name: "Komerční Banka", code: "0100" },
      { bic: "CEKOCZPP", name: "Česká Spořitelna", code: "0800" },
      { bic: "BACXCZPP", name: "ČSOB", code: "0300" },
      { bic: "GIBACZPX", name: "UniCredit Bank Czech", code: "2700" },
      { bic: "FIOBCZPP", name: "Fio Banka", code: "2010" },
    ],
  },
  DK: {
    name: "Denmark",
    ibanLength: 18,
    currency: "DKK",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "account", label: "Account Number", length: 10 },
    ],
    banks: [
      { bic: "DABADKKK", name: "Danske Bank", code: "0216" },
      { bic: "SPNODK22", name: "Nordea Denmark", code: "2000" },
      { bic: "JYBADKKK", name: "Jyske Bank", code: "5030" },
      { bic: "SYDBDK22", name: "Sydbank", code: "5440" },
      { bic: "PENGDKKK", name: "Arbejdernes Landsbank", code: "5005" },
    ],
  },
  EE: {
    name: "Estonia",
    ibanLength: 20,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 2 },
      { type: "branch", label: "Branch", length: 2 },
      { type: "account", label: "Account Number", length: 11 },
      { type: "check", label: "Check Digit", length: 1 },
    ],
    banks: [
      { bic: "EUEBEE22", name: "Luminor Bank", code: "77" },
      { bic: "HABAEE22", name: "Swedbank", code: "22" },
      { bic: "FOREEE2X", name: "SEB Pank", code: "10" },
      { bic: "COBAEE2X", name: "Coop Pank", code: "70" },
    ],
  },
  FI: {
    name: "Finland",
    ibanLength: 18,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank + Branch", length: 6 },
      { type: "account", label: "Account Number", length: 7 },
      { type: "check", label: "Check Digit", length: 1 },
    ],
    banks: [
      { bic: "NDEAFIHH", name: "Nordea Finland", code: "123456" },
      { bic: "OPFIHIHH", name: "OP Financial Group", code: "500001" },
      { bic: "DABAFIHH", name: "Danske Bank Finland", code: "800012" },
      { bic: "HANDFIHH", name: "Handelsbanken Finland", code: "313130" },
      { bic: "SBSPFIHH", name: "S-Bank", code: "405005" },
    ],
  },
  FR: {
    name: "France",
    ibanLength: 27,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 5 },
      { type: "branch", label: "Branch Code", length: 5 },
      { type: "account", label: "Account Number", length: 11, charset: "c" },
      { type: "nationalCheck", label: "RIB Key", length: 2 },
    ],
    banks: [
      { bic: "AGRIFRPP", name: "Crédit Agricole", code: "30006" },
      { bic: "BNPAFRPP", name: "BNP Paribas", code: "30004" },
      { bic: "SOGEFRPP", name: "Société Générale", code: "30003" },
      { bic: "CMCIFRPP", name: "Crédit Mutuel", code: "10278" },
      { bic: "CCBPFRPP", name: "Banque Populaire", code: "10107" },
    ],
  },
  DE: {
    name: "Germany",
    ibanLength: 22,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bankleitzahl", length: 8 },
      { type: "account", label: "Kontonummer", length: 10 },
    ],
    banks: [
      { bic: "BYLADEM1KMS", name: "Sparkasse KölnBonn", code: "37050198" },
      { bic: "DEUTDEFF", name: "Deutsche Bank", code: "50070010" },
      { bic: "HYVEDEMM", name: "HypoVereinsbank", code: "70020270" },
      { bic: "COBADEFF", name: "Commerzbank", code: "40040060" },
      { bic: "GENODEF1S02", name: "Berliner Sparkasse", code: "10050000" },
      { bic: "DRESDEFF", name: "Commerzbank (Dresdner)", code: "12080000" },
    ],
  },
  GR: {
    name: "Greece",
    ibanLength: 27,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 3 },
      { type: "branch", label: "Branch", length: 4 },
      { type: "account", label: "Account Number", length: 16 },
    ],
    banks: [
      { bic: "ETHNGRAA", name: "National Bank of Greece", code: "011" },
      { bic: "PIRBGRAA", name: "Piraeus Bank", code: "017" },
      { bic: "EURBGRAA", name: "Eurobank", code: "026" },
      { bic: "ALPHGRAA", name: "Alpha Bank", code: "014" },
    ],
  },
  HU: {
    name: "Hungary",
    ibanLength: 28,
    currency: "HUF",
    bban: [
      { type: "bank", label: "Bank Code", length: 3 },
      { type: "branch", label: "Branch", length: 4 },
      { type: "check", label: "Check Digit", length: 1 },
      { type: "account", label: "Account Number", length: 15 },
      { type: "check2", label: "Check Digit", length: 1 },
    ],
    banks: [
      { bic: "OTPVHUHB", name: "OTP Bank", code: "117" },
      { bic: "CIBHHUHB", name: "CIB Bank", code: "107" },
      { bic: "KELVHUHB", name: "K&H Bank", code: "104" },
      { bic: "UBRTHUHB", name: "UniCredit Bank Hungary", code: "109" },
      { bic: "MKKBHUHB", name: "Magyar Külkereskedelmi Bank", code: "144" },
    ],
  },
  IE: {
    name: "Ireland",
    ibanLength: 22,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "branch", label: "Sort Code", length: 6 },
      { type: "account", label: "Account Number", length: 8 },
    ],
    banks: [
      { bic: "AIBKIE2D", name: "Allied Irish Banks", code: "AIBK" },
      { bic: "BOFIIE2D", name: "Bank of Ireland", code: "BOFI" },
      { bic: "ULBKIE2D", name: "Ulster Bank", code: "ULBK" },
      { bic: "PERMIE22", name: "Permanent TSB", code: "IPBS" },
      { bic: "KBCIIE2D", name: "KBC Bank Ireland", code: "KBCI" },
    ],
  },
  IT: {
    name: "Italy",
    ibanLength: 27,
    currency: "EUR",
    bban: [
      { type: "check", label: "CIN (Check)", length: 1, charset: "a" },
      { type: "bank", label: "Bank Code (ABI)", length: 5 },
      { type: "branch", label: "Branch (CAB)", length: 5 },
      { type: "account", label: "Account Number", length: 12 },
    ],
    banks: [
      { bic: "BCITITMM", name: "Intesa Sanpaolo", code: "03069" },
      { bic: "UNCRITMM", name: "UniCredit", code: "02008" },
      { bic: "BAPPIT21", name: "Banca Popolare di Sondrio", code: "05696" },
      { bic: "BMCVIT2T", name: "Banco BPM", code: "05034" },
      { bic: "BPCVIT2S", name: "Banca Popolare di Milano", code: "05584" },
    ],
  },
  LV: {
    name: "Latvia",
    ibanLength: 21,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "account", label: "Account Number", length: 13 },
    ],
    banks: [
      { bic: "HABALV22", name: "Swedbank Latvia", code: "HABA" },
      { bic: "UNLALV2X", name: "SEB Banka", code: "UNLA" },
      { bic: "RIKOLV2X", name: "Citadele Banka", code: "RIKO" },
      { bic: "LATBLV22", name: "Luminor Bank Latvia", code: "LATB" },
      { bic: "AIBKLV22", name: "BlueOrange Bank", code: "AIBK" },
    ],
  },
  LT: {
    name: "Lithuania",
    ibanLength: 20,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 5 },
      { type: "account", label: "Account Number", length: 11 },
    ],
    banks: [
      { bic: "CBVILT2X", name: "Swedbank Lithuania", code: "73000" },
      { bic: "AGBLLT2X", name: "SEB Bankas", code: "70440" },
      { bic: "REVOLT21", name: "Revolut Lithuania", code: "70100" },
      { bic: "LUMOLT2X", name: "Luminor Bank Lithuania", code: "40100" },
      { bic: "CIBKLT2X", name: "Citadele Lithuania", code: "72900" },
    ],
  },
  LU: {
    name: "Luxembourg",
    ibanLength: 20,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 3 },
      { type: "account", label: "Account Number", length: 13 },
    ],
    banks: [
      { bic: "BCEELULL", name: "Banque Centrale du Luxembourg", code: "001" },
      { bic: "BGLLLULL", name: "BGL BNP Paribas", code: "003" },
      { bic: "ABOLLULL", name: "Banque et Caisse d'Épargne de l'État", code: "001" },
      { bic: "PROLLULL", name: "Banque Internationale à Luxembourg", code: "002" },
      { bic: "PRIBUS21", name: "PRIVATE BANKING", code: "006" },
    ],
  },
  MT: {
    name: "Malta",
    ibanLength: 31,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "branch", label: "Branch", length: 5 },
      { type: "account", label: "Account Number", length: 18 },
    ],
    banks: [
      { bic: "MALTMTMT", name: "Bank of Valletta", code: "VALL" },
      { bic: "HSBCMTMT", name: "HSBC Malta", code: "MELT" },
      { bic: "AKSBMTMT", name: "APS Bank", code: "AKSB" },
      { bic: "BMFEMTMT", name: "BNF Bank", code: "BNFE" },
      { bic: "LOMAMTMT", name: "Lombard Bank Malta", code: "LOMA" },
    ],
  },
  NL: {
    name: "Netherlands",
    ibanLength: 18,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 4, charset: "a" },
      { type: "account", label: "Account Number", length: 10 },
    ],
    banks: [
      { bic: "ABNANL2A", name: "ABN AMRO", code: "ABNA" },
      { bic: "RABONL2U", name: "Rabobank", code: "RABO" },
      { bic: "INGBNL2A", name: "ING Bank", code: "INGB" },
      { bic: "SNSBNL2A", name: "SNS Bank", code: "SNSB" },
      { bic: "TRIONL2U", name: "Triodos Bank", code: "TRIO" },
    ],
  },
  PL: {
    name: "Poland",
    ibanLength: 28,
    currency: "PLN",
    bban: [
      { type: "bank", label: "Bank Code", length: 3 },
      { type: "branch", label: "Branch", length: 4 },
      { type: "check", label: "Check Digit", length: 1 },
      { type: "account", label: "Account Number", length: 16 },
    ],
    banks: [
      { bic: "BPKOPLPW", name: "PKO Bank Polski", code: "102" },
      { bic: "PKOPPLPW", name: "Pekao SA", code: "124" },
      { bic: "INGBPLPW", name: "ING Bank Śląski", code: "105" },
      { bic: "WBKPPLPP", name: "Santander Bank Polska", code: "109" },
      { bic: "BIGBPLPW", name: "mBank", code: "114" },
    ],
  },
  PT: {
    name: "Portugal",
    ibanLength: 25,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "branch", label: "Branch", length: 4 },
      { type: "account", label: "Account Number", length: 11 },
      { type: "nationalCheck", label: "Check Digits", length: 2 },
    ],
    banks: [
      { bic: "CGDIPTPL", name: "Caixa Geral de Depósitos", code: "0035" },
      { bic: "BCOMPTPL", name: "Millennium BCP", code: "0033" },
      { bic: "BBVAPTPL", name: "Banco BPI", code: "0010" },
      { bic: "BESCPTPL", name: "Novo Banco", code: "0007" },
      { bic: "SANTGBPL", name: "Santander Totta", code: "0018" },
    ],
  },
  RO: {
    name: "Romania",
    ibanLength: 24,
    currency: "RON",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "account", label: "Account Number", length: 16 },
    ],
    banks: [
      { bic: "RNCBROBU", name: "Banca Comercială Română", code: "RNCB" },
      { bic: "BRDEROBU", name: "BRD Groupe Société Générale", code: "BRDE" },
      { bic: "BTRLROBU", name: "Banca Transilvania", code: "BTRL" },
      { bic: "INGBROBU", name: "ING Bank Romania", code: "INGB" },
      { bic: "CECEROBU", name: "CEC Bank", code: "CECE" },
    ],
  },
  SK: {
    name: "Slovakia",
    ibanLength: 24,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "prefix", label: "Prefix", length: 6 },
      { type: "account", label: "Account Number", length: 10 },
    ],
    banks: [
      { bic: "SUBASKBX", name: "Slovenská Sporiteľňa", code: "0900" },
      { bic: "TATRSKBX", name: "Tatra Banka", code: "1100" },
      { bic: "UNCRSKBX", name: "UniCredit Bank Slovakia", code: "1111" },
      { bic: "FIOZSKBA", name: "Fio Banka Slovakia", code: "8330" },
      { bic: "GIBASKBX", name: "365.bank", code: "6500" },
    ],
  },
  SI: {
    name: "Slovenia",
    ibanLength: 19,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 2 },
      { type: "branch", label: "Branch", length: 3 },
      { type: "account", label: "Account Number", length: 8 },
      { type: "check", label: "Check Digit", length: 2 },
    ],
    banks: [
      { bic: "LJBASISX", name: "NLB Banka", code: "02" },
      { bic: "BACXSISX", name: "NKBM", code: "04" },
      { bic: "ABANSI2X", name: "Abanka", code: "05" },
      { bic: "HDELSISX", name: "Sparkasse Slovenija", code: "10" },
      { bic: "FTVLSISX", name: "Gorenjska Banka", code: "27" },
    ],
  },
  ES: {
    name: "Spain",
    ibanLength: 24,
    currency: "EUR",
    bban: [
      { type: "bank", label: "Bank Code", length: 4 },
      { type: "branch", label: "Branch", length: 4 },
      { type: "check", label: "Control Digit", length: 2 },
      { type: "account", label: "Account Number", length: 10 },
    ],
    banks: [
      { bic: "BBVAESMM", name: "BBVA", code: "0182" },
      { bic: "BSCHESMM", name: "Santander", code: "0049" },
      { bic: "CAIXESBB", name: "CaixaBank", code: "2100" },
      { bic: "BKBKESMM", name: "Bankinter", code: "0128" },
      { bic: "SABRESSM", name: "Banco Sabadell", code: "0081" },
    ],
  },
  SE: {
    name: "Sweden",
    ibanLength: 24,
    currency: "SEK",
    bban: [
      { type: "bank", label: "Bank Code", length: 3 },
      { type: "account", label: "Account Number", length: 17 },
    ],
    banks: [
      { bic: "SWEDSESS", name: "Swedbank", code: "800" },
      { bic: "NDEASESS", name: "Nordea Sweden", code: "600" },
      { bic: "HANDSESS", name: "Handelsbanken", code: "600" },
      { bic: "SEBISESS", name: "SEB", code: "500" },
      { bic: "DABASESX", name: "Danske Bank Sweden", code: "120" },
    ],
  },
};

export function getCountryList() {
  return Object.entries(COUNTRIES)
    .map(([code, data]) => ({
      code,
      name: data.name,
      currency: data.currency,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
