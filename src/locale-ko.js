// Keep procedural generation keys in English. Translate only displayed district names.
export const districtName = name => ({ 'Old town': '구시가지', 'Garden quarter': '정원 지구', 'Warehouse district': '창고 지구', 'Market district': '시장 지구', 'Civic quarter': '행정 지구', Midtown: '중심 지구' }[name] ?? name);
