/* ===== v26: no scenario wording left on the Forecast heading ===== */
const forecastBase26=forecast;
forecast=function(M){ return forecastBase26(M).replace(/(<h2>)[^<]*? scenario( · weighted)? · /,(m,a,w)=>a+'Forecast'+(w?' · weighted':'')+' · '); };
const cdBase26=countryDetail;
countryDetail=function(name){ return cdBase26(name).replace(/ · (?:Plan|Weighted) case/,''); };
