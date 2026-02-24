// 7개 경로 세트 생성 (경도 기준 지구 순환 경로)
// 각 경로는 200개 도시로 구성

// 모든 도시를 경도 기준으로 정렬
function sortCitiesByLongitude(cities) {
    return [...cities].sort((a, b) => a.lng - b.lng);
}

// 시작 지점을 기준으로 경로 재배열
function reorderRouteFromStart(route, startCityName) {
    const startIndex = route.findIndex(city => city.name === startCityName);
    if (startIndex === -1) return route;

    // 시작 지점부터 끝까지 + 처음부터 시작 지점 전까지
    return [...route.slice(startIndex), ...route.slice(0, startIndex)];
}

// 7개 경로 세트 생성
function generateRouteSets(allCities) {
    // 경도 기준 정렬
    const sortedCities = sortCitiesByLongitude(allCities);

    const routeSets = {
        A: { name: "경로 A - 아시아/오세아니아 출발", cities: [], color: "#e94560" },
        B: { name: "경로 B - 유럽/아프리카 출발", cities: [], color: "#4ecca3" },
        C: { name: "경로 C - 아메리카 출발", cities: [], color: "#ffd93d" },
        D: { name: "경로 D - 태평양 횡단", cities: [], color: "#6c5ce7" },
        E: { name: "경로 E - 대서양 횡단", cities: [], color: "#00cec9" },
        F: { name: "경로 F - 적도 횡단", cities: [], color: "#fd79a8" },
        G: { name: "경로 G - 극지방 경유", cities: [], color: "#a29bfe" }
    };

    // 도시를 7개 그룹으로 분배 (각 200개씩, 경도 기준으로 균등 분배)
    const totalCities = sortedCities.length;
    const citiesPerRoute = 200;

    // 방법: 전체 도시를 7개 그룹으로 나누되, 각 그룹이 전 세계를 커버하도록
    // 경도 순으로 정렬된 도시를 7개씩 순환하며 분배
    const routeKeys = Object.keys(routeSets);

    sortedCities.forEach((city, index) => {
        const routeIndex = index % 7;
        const routeKey = routeKeys[routeIndex];
        if (routeSets[routeKey].cities.length < citiesPerRoute) {
            routeSets[routeKey].cities.push(city);
        }
    });

    // 남은 도시들을 분배 (1476개 중 1400개 분배 후 76개 남음)
    const assignedCount = Object.values(routeSets).reduce((sum, r) => sum + r.cities.length, 0);
    let remainingCities = sortedCities.slice(assignedCount);

    // 남은 도시들을 각 경로에 추가 (200개 미만인 경로에)
    routeKeys.forEach((key, idx) => {
        while (routeSets[key].cities.length < citiesPerRoute && remainingCities.length > 0) {
            routeSets[key].cities.push(remainingCities.shift());
        }
    });

    // 각 경로를 경도 순으로 다시 정렬 (지구 순환 경로)
    routeKeys.forEach(key => {
        routeSets[key].cities = sortCitiesByLongitude(routeSets[key].cities);
    });

    return routeSets;
}

// 경로 미리보기용 정보 생성
function getRoutePreview(route) {
    if (!route.cities || route.cities.length === 0) return null;

    const cities = route.cities;
    const continents = {
        asia: 0,
        europe: 0,
        africa: 0,
        northAmerica: 0,
        southAmerica: 0,
        oceania: 0
    };

    // 대륙별 도시 수 계산 (대략적인 경도/위도 기준)
    cities.forEach(city => {
        if (city.lng >= 60 && city.lng <= 180) {
            if (city.lat < -10) continents.oceania++;
            else continents.asia++;
        } else if (city.lng >= -30 && city.lng < 60) {
            if (city.lat < 0) continents.africa++;
            else continents.europe++;
        } else if (city.lng >= -180 && city.lng < -30) {
            if (city.lat < 15) continents.southAmerica++;
            else continents.northAmerica++;
        }
    });

    return {
        name: route.name,
        color: route.color,
        cityCount: cities.length,
        continents: continents,
        sampleCities: [
            cities[0]?.name,
            cities[Math.floor(cities.length * 0.25)]?.name,
            cities[Math.floor(cities.length * 0.5)]?.name,
            cities[Math.floor(cities.length * 0.75)]?.name,
            cities[cities.length - 1]?.name
        ].filter(Boolean)
    };
}

// 전역 변수로 경로 세트 저장
let routeSets = null;

// 초기화 함수
function initializeRoutes() {
    if (!routeSets && typeof worldCities !== 'undefined') {
        routeSets = generateRouteSets(worldCities);
        console.log("경로 세트 초기화 완료:", Object.keys(routeSets).map(k =>
            `${k}: ${routeSets[k].cities.length}개 도시`
        ));
    }
    return routeSets;
}
