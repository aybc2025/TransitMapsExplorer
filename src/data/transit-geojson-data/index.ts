// ייצוא מרכזי של כל נתוני ה-GeoJSON
// נוצר אוטומטית - 2026-01-13

import { algiersMetro } from './algiers-metro';
import { amsterdamMetro } from './amsterdam-metro';
import { athensMetro } from './athens-metro';
import { bangaloreMetro } from './bangalore-metro';
import { bangkokBTS } from './bangkok-bts';
import { barcelonaMetro } from './barcelona-metro';
import { beijingSubway } from './beijing-subway';
import { berlinUBahn } from './berlin-ubahn';
import { bostonMBTA } from './boston-mbta';
import { brusselsMetro } from './brussels-metro';
import { budapestMetro } from './budapest-metro';
import { buenosAiresSubte } from './buenos-aires-subte';
import { busanMetro } from './busan-metro';
import { cairoMetro } from './cairo-metro';
import { chennaiMetro } from './chennai-metro';
import { chicagoL } from './chicago-l';
import { chongqingRail } from './chongqing-rail';
import { copenhagenMetro } from './copenhagen-metro';
import { delhiMetro } from './delhi-metro';
import { dohaMetro } from './doha-metro';
import { dubaiMetro } from './dubai-metro';
import { glasgowSubway } from './glasgow-subway';
import { guangzhouMetro } from './guangzhou-metro';
import { hamburgUBahn } from './hamburg-ubahn';
import { helsinkiMetro } from './helsinki-metro';
import { hongKongMTR } from './hong-kong-mtr';
import { hyderabadMetro } from './hyderabad-metro';
import { istanbulMetro } from './istanbul-metro';
import { jakartaMRT } from './jakarta-mrt';
import { johannesburgGautrain } from './johannesburg-gautrain';
import { kolkataMetro } from './kolkata-metro';
import { kualaLumpurRail } from './kuala-lumpur-rail';
import { limaMetro } from './lima-metro';
import { lisbonMetro } from './lisbon-metro';
import { londonUnderground } from './london-underground';
import { losAngelesMetro } from './los-angeles-metro';
import { lyonMetro } from './lyon-metro';
import { madridMetro } from './madrid-metro';
import { marseilleMetro } from './marseille-metro';
import { medellinMetro } from './medellin-metro';
import { mexicoCityMetro } from './mexico-city-metro';
import { milanMetro } from './milan-metro';
import { montrealMetro } from './montreal-metro';
import { moscowMetro } from './moscow-metro';
import { mumbaiMetro } from './mumbai-metro';
import { munichUBahn } from './munich-ubahn';
import { nagoyaSubway } from './nagoya-subway';
import { nanjingMetro } from './nanjing-metro';
import { newYorkSubway } from './new-york-subway';
import { osakaMetro } from './osaka-metro';
import { osloMetro } from './oslo-metro';
import { parisMetro } from './paris-metro';
import { philadelphiaSEPTA } from './philadelphia-septa';
import { pragueMetro } from './prague-metro';
import { riyadhMetro } from './riyadh-metro';
import { romeMetro } from './rome-metro';
import { saintPetersburgMetro } from './saint-petersburg-metro';
import { sanFranciscoBART } from './san-francisco-bart';
import { santiagoMetro } from './santiago-metro';
import { saoPauloMetro } from './sao-paulo-metro';
import { seoulMetro } from './seoul-metro';
import { shanghaiMetro } from './shanghai-metro';
import { shenzhenMetro } from './shenzhen-metro';
import { singaporeMRT } from './singapore-mrt';
import { stockholmMetro } from './stockholm-metro';
import { sydneyMetro } from './sydney-metro';
import { taipeiMetro } from './taipei-metro';
import { tehranMetro } from './tehran-metro';
import { tokyoMetro } from './tokyo-metro';
import { torontoTTC } from './toronto-ttc';
import { vancouverSkytrain } from './vancouver-skytrain';
import { viennaUBahn } from './vienna-ubahn';
import { warsawMetro } from './warsaw-metro';
import { washingtonMetro } from './washington-metro';
import { wuhanMetro } from './wuhan-metro';

export interface TransitLine {
  name: string;
  shortName: string;
  color: string;
  coordinates: number[][];
}

export interface TransitSystemData {
  center: number[];
  zoom: number;
  lines: TransitLine[];
}

export const TRANSIT_GEOJSON: Record<string, TransitSystemData> = {
  'algiers-metro': algiersMetro,
  'amsterdam-metro': amsterdamMetro,
  'athens-metro': athensMetro,
  'bangalore-metro': bangaloreMetro,
  'bangkok-bts': bangkokBTS,
  'barcelona-metro': barcelonaMetro,
  'beijing-subway': beijingSubway,
  'berlin-ubahn': berlinUBahn,
  'boston-mbta': bostonMBTA,
  'brussels-metro': brusselsMetro,
  'budapest-metro': budapestMetro,
  'buenos-aires-subte': buenosAiresSubte,
  'busan-metro': busanMetro,
  'cairo-metro': cairoMetro,
  'chennai-metro': chennaiMetro,
  'chicago-l': chicagoL,
  'chongqing-rail': chongqingRail,
  'copenhagen-metro': copenhagenMetro,
  'delhi-metro': delhiMetro,
  'doha-metro': dohaMetro,
  'dubai-metro': dubaiMetro,
  'glasgow-subway': glasgowSubway,
  'guangzhou-metro': guangzhouMetro,
  'hamburg-ubahn': hamburgUBahn,
  'helsinki-metro': helsinkiMetro,
  'hong-kong-mtr': hongKongMTR,
  'hyderabad-metro': hyderabadMetro,
  'istanbul-metro': istanbulMetro,
  'jakarta-mrt': jakartaMRT,
  'johannesburg-gautrain': johannesburgGautrain,
  'kolkata-metro': kolkataMetro,
  'kuala-lumpur-rail': kualaLumpurRail,
  'lima-metro': limaMetro,
  'lisbon-metro': lisbonMetro,
  'london-underground': londonUnderground,
  'los-angeles-metro': losAngelesMetro,
  'lyon-metro': lyonMetro,
  'madrid-metro': madridMetro,
  'marseille-metro': marseilleMetro,
  'medellin-metro': medellinMetro,
  'mexico-city-metro': mexicoCityMetro,
  'milan-metro': milanMetro,
  'montreal-metro': montrealMetro,
  'moscow-metro': moscowMetro,
  'mumbai-metro': mumbaiMetro,
  'munich-ubahn': munichUBahn,
  'nagoya-subway': nagoyaSubway,
  'nanjing-metro': nanjingMetro,
  'new-york-subway': newYorkSubway,
  'osaka-metro': osakaMetro,
  'oslo-metro': osloMetro,
  'paris-metro': parisMetro,
  'philadelphia-septa': philadelphiaSEPTA,
  'prague-metro': pragueMetro,
  'riyadh-metro': riyadhMetro,
  'rome-metro': romeMetro,
  'saint-petersburg-metro': saintPetersburgMetro,
  'san-francisco-bart': sanFranciscoBART,
  'santiago-metro': santiagoMetro,
  'sao-paulo-metro': saoPauloMetro,
  'seoul-metro': seoulMetro,
  'shanghai-metro': shanghaiMetro,
  'shenzhen-metro': shenzhenMetro,
  'singapore-mrt': singaporeMRT,
  'stockholm-metro': stockholmMetro,
  'sydney-metro': sydneyMetro,
  'taipei-metro': taipeiMetro,
  'tehran-metro': tehranMetro,
  'tokyo-metro': tokyoMetro,
  'toronto-ttc': torontoTTC,
  'vancouver-skytrain': vancouverSkytrain,
  'vienna-ubahn': viennaUBahn,
  'warsaw-metro': warsawMetro,
  'washington-metro': washingtonMetro,
  'wuhan-metro': wuhanMetro,
};
