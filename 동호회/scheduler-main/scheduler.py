# -*- coding: utf-8 -*-
"""
배드민턴 대진표 생성 알고리즘
조건:
- 청백전 (청팀 vs 백팀)
- 남자복식, 여자복식, 혼합복식
- 1인당 4~5게임
- 같은 급수: 남복 1 + 혼복 1
- 상급자+하급자 페어: 남복 1 + 혼복 1
- 여성: 여복 1 + 혼복 1~2
- 파트너/상대 중복 금지
- 연속 경기 피하기
- 코트 6개, 코트당 10~12게임
- **팀 간 실력 차이는 1등급 이내** (합계 점수 차이 1 이하)
"""

import random
from collections import defaultdict
from players import MALE_PLAYERS, FEMALE_PLAYERS, assign_teams

# 등급별 점수 (A=5, B=4, C=3, D=2, E=1)
GRADE_SCORE = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1}

class Match:
    """경기 정보"""
    def __init__(self, match_type, team1, team2, court=None, round_num=None):
        self.match_type = match_type  # 'MD': 남복, 'WD': 여복, 'XD': 혼복
        self.team1 = team1  # (player1, player2) - 청팀
        self.team2 = team2  # (player1, player2) - 백팀
        self.court = court
        self.round_num = round_num  # 전체 라운드 번호

    def __repr__(self):
        t1 = f"{self.team1[0]}+{self.team1[1]}"
        t2 = f"{self.team2[0]}+{self.team2[1]}"
        return f"[{self.match_type}] 청({t1}) vs 백({t2})"

    def get_players(self):
        return [self.team1[0], self.team1[1], self.team2[0], self.team2[1]]


class MatchScheduler:
    """대진표 생성기"""

    def __init__(self):
        self.blue, self.white = assign_teams()
        self.matches = []
        self.player_games = defaultdict(int)  # 선수별 경기 수
        self.player_partners = defaultdict(set)  # 선수별 파트너 기록
        self.player_opponents = defaultdict(set)  # 선수별 상대 기록
        self.player_schedule = defaultdict(list)  # 선수별 경기 순서
        self.player_grade = {}  # 선수별 등급

        # 급수별 선수 분류
        self.blue_males_by_grade = defaultdict(list)
        self.blue_females_by_grade = defaultdict(list)
        self.white_males_by_grade = defaultdict(list)
        self.white_females_by_grade = defaultdict(list)

        for name, grade in self.blue['male']:
            self.blue_males_by_grade[grade].append(name)
            self.player_grade[name] = grade
        for name, grade in self.blue['female']:
            self.blue_females_by_grade[grade].append(name)
            self.player_grade[name] = grade
        for name, grade in self.white['male']:
            self.white_males_by_grade[grade].append(name)
            self.player_grade[name] = grade
        for name, grade in self.white['female']:
            self.white_females_by_grade[grade].append(name)
            self.player_grade[name] = grade

    def get_team_score(self, team):
        """팀 합계 점수 계산 (2명)"""
        return sum(GRADE_SCORE[self.player_grade[p]] for p in team)

    def is_balanced_match(self, team1, team2, max_diff=1):
        """두 팀의 실력 차이가 max_diff 이내인지 확인"""
        score1 = self.get_team_score(team1)
        score2 = self.get_team_score(team2)
        return abs(score1 - score2) <= max_diff

    def can_pair(self, p1, p2):
        """두 선수가 파트너가 될 수 있는지"""
        return p2 not in self.player_partners[p1]

    def can_face(self, p1, p2):
        """두 선수가 상대할 수 있는지"""
        return p2 not in self.player_opponents[p1]

    def can_play(self, player, target_games=5):
        """선수가 더 경기할 수 있는지"""
        return self.player_games[player] < target_games

    def add_match(self, match):
        """경기 추가 및 기록 업데이트"""
        self.matches.append(match)

        players = match.get_players()
        for p in players:
            self.player_games[p] += 1
            self.player_schedule[p].append(len(self.matches))

        # 파트너 기록
        self.player_partners[match.team1[0]].add(match.team1[1])
        self.player_partners[match.team1[1]].add(match.team1[0])
        self.player_partners[match.team2[0]].add(match.team2[1])
        self.player_partners[match.team2[1]].add(match.team2[0])

        # 상대 기록
        for p1 in match.team1:
            for p2 in match.team2:
                self.player_opponents[p1].add(p2)
                self.player_opponents[p2].add(p1)

    def generate_same_grade_matches(self):
        """같은 급수끼리 경기 생성"""
        grades = ['A', 'B', 'C', 'D', 'E']

        for grade in grades:
            # 남자복식 (같은 급수)
            blue_males = self.blue_males_by_grade[grade][:]
            white_males = self.white_males_by_grade[grade][:]

            random.shuffle(blue_males)
            random.shuffle(white_males)

            # 2명씩 짝지어 경기
            while len(blue_males) >= 2 and len(white_males) >= 2:
                b1, b2 = blue_males.pop(), blue_males.pop()
                w1, w2 = white_males.pop(), white_males.pop()

                if self.can_pair(b1, b2) and self.can_pair(w1, w2):
                    match = Match('MD', (b1, b2), (w1, w2))
                    self.add_match(match)

            # 혼합복식 (같은 급수)
            blue_males = self.blue_males_by_grade[grade][:]
            blue_females = self.blue_females_by_grade[grade][:]
            white_males = self.white_males_by_grade[grade][:]
            white_females = self.white_females_by_grade[grade][:]

            random.shuffle(blue_males)
            random.shuffle(blue_females)
            random.shuffle(white_males)
            random.shuffle(white_females)

            while blue_males and blue_females and white_males and white_females:
                bm = blue_males.pop()
                bf = blue_females.pop()
                wm = white_males.pop()
                wf = white_females.pop()

                if self.can_pair(bm, bf) and self.can_pair(wm, wf):
                    match = Match('XD', (bm, bf), (wm, wf))
                    self.add_match(match)

    def generate_mixed_grade_matches(self):
        """상급자+하급자 페어 경기 생성 (실력 차이 1등급 이내)"""
        # 1등급 차이만 허용하는 조합 (A+B, B+C, C+D, D+E)
        grade_pairs = [('A', 'B'), ('B', 'C'), ('C', 'D'), ('D', 'E')]

        for high, low in grade_pairs:
            # 남자복식 (상급자+하급자) - 같은 등급 조합끼리 대전
            blue_high = [p for p in self.blue_males_by_grade[high] if self.can_play(p)]
            blue_low = [p for p in self.blue_males_by_grade[low] if self.can_play(p)]
            white_high = [p for p in self.white_males_by_grade[high] if self.can_play(p)]
            white_low = [p for p in self.white_males_by_grade[low] if self.can_play(p)]

            random.shuffle(blue_high)
            random.shuffle(blue_low)
            random.shuffle(white_high)
            random.shuffle(white_low)

            while blue_high and blue_low and white_high and white_low:
                bh = blue_high.pop()
                bl = blue_low.pop()
                wh = white_high.pop()
                wl = white_low.pop()

                if self.can_pair(bh, bl) and self.can_pair(wh, wl):
                    team1 = (bh, bl)
                    team2 = (wh, wl)
                    # 실력 균형 검증
                    if self.is_balanced_match(team1, team2):
                        match = Match('MD', team1, team2)
                        self.add_match(match)
                        break  # 한 조합당 1경기

            # 혼합복식 (상급자+하급자) - 남자 상급+여자 하급 vs 남자 상급+여자 하급
            blue_high_m = [p for p in self.blue_males_by_grade[high] if self.can_play(p)]
            blue_low_f = [p for p in self.blue_females_by_grade[low] if self.can_play(p)]
            white_high_m = [p for p in self.white_males_by_grade[high] if self.can_play(p)]
            white_low_f = [p for p in self.white_females_by_grade[low] if self.can_play(p)]

            random.shuffle(blue_high_m)
            random.shuffle(blue_low_f)
            random.shuffle(white_high_m)
            random.shuffle(white_low_f)

            while blue_high_m and blue_low_f and white_high_m and white_low_f:
                bm = blue_high_m.pop()
                bf = blue_low_f.pop()
                wm = white_high_m.pop()
                wf = white_low_f.pop()

                if self.can_pair(bm, bf) and self.can_pair(wm, wf):
                    team1 = (bm, bf)
                    team2 = (wm, wf)
                    # 실력 균형 검증
                    if self.is_balanced_match(team1, team2):
                        match = Match('XD', team1, team2)
                        self.add_match(match)
                        break  # 한 조합당 1경기

    def generate_womens_doubles(self):
        """여자복식 경기 생성 (실력 균형 유지)"""
        grades = ['A', 'B', 'C', 'D', 'E']

        # 같은 급수 또는 인접 급수끼리
        for i, grade in enumerate(grades):
            blue_females = [p for p in self.blue_females_by_grade[grade] if self.can_play(p)]
            white_females = [p for p in self.white_females_by_grade[grade] if self.can_play(p)]

            # 인접 급수도 포함
            if i < len(grades) - 1:
                next_grade = grades[i + 1]
                blue_females += [p for p in self.blue_females_by_grade[next_grade] if self.can_play(p)]
                white_females += [p for p in self.white_females_by_grade[next_grade] if self.can_play(p)]

            random.shuffle(blue_females)
            random.shuffle(white_females)

            # 실력 균형 맞는 조합 찾기
            match_found = False
            for b1 in blue_females:
                if match_found:
                    break
                for b2 in blue_females:
                    if match_found:
                        break
                    if b1 >= b2 or not self.can_pair(b1, b2):
                        continue
                    team1 = (b1, b2)
                    for w1 in white_females:
                        if match_found:
                            break
                        for w2 in white_females:
                            if w1 >= w2 or not self.can_pair(w1, w2):
                                continue
                            team2 = (w1, w2)
                            if self.is_balanced_match(team1, team2):
                                match = Match('WD', team1, team2)
                                self.add_match(match)
                                match_found = True
                                break

    def fill_remaining_games(self, target_min=4, target_max=5):
        """부족한 경기 수 채우기 (남자, 여자 모두) - 실력 균형 유지"""
        all_blue_males = [p for p, g in self.blue['male']]
        all_blue_females = [p for p, g in self.blue['female']]
        all_white_males = [p for p, g in self.white['male']]
        all_white_females = [p for p, g in self.white['female']]

        # 먼저 여성 경기 보충 (여자복식, 혼합복식)
        for _ in range(30):
            under_females = [p for p in all_blue_females + all_white_females
                           if self.player_games[p] < target_min]
            if not under_females:
                break

            random.shuffle(under_females)

            for player in under_females:
                if self.player_games[player] >= target_min:
                    continue

                is_blue = player in all_blue_females

                # 혼합복식 시도
                if is_blue:
                    male_partners = [p for p in all_blue_males
                                   if self.can_pair(player, p) and self.can_play(p, target_max)]
                    if male_partners:
                        random.shuffle(male_partners)
                        for partner in male_partners:
                            team1 = (partner, player)
                            # 백팀 혼합 상대 찾기 (실력 균형 맞는 것만)
                            opponents = [(m, f) for m in all_white_males for f in all_white_females
                                       if self.can_pair(m, f)
                                       and self.can_face(player, m) and self.can_face(player, f)
                                       and self.can_play(m, target_max) and self.can_play(f, target_max)
                                       and self.is_balanced_match(team1, (m, f))]
                            if opponents:
                                opp = random.choice(opponents)
                                match = Match('XD', team1, opp)
                                self.add_match(match)
                                break
                        else:
                            continue
                        continue

                    # 여자복식 시도
                    female_partners = [p for p in all_blue_females
                                     if p != player and self.can_pair(player, p)
                                     and self.can_play(p, target_max)]
                    if female_partners:
                        random.shuffle(female_partners)
                        for partner in female_partners:
                            team1 = (player, partner)
                            opponents = [(p1, p2) for p1 in all_white_females for p2 in all_white_females
                                       if p1 < p2 and self.can_pair(p1, p2)
                                       and self.can_face(player, p1) and self.can_face(player, p2)
                                       and self.can_play(p1, target_max) and self.can_play(p2, target_max)
                                       and self.is_balanced_match(team1, (p1, p2))]
                            if opponents:
                                opp = random.choice(opponents)
                                match = Match('WD', team1, opp)
                                self.add_match(match)
                                break
                        else:
                            continue
                        continue
                else:
                    # 백팀 여성
                    male_partners = [p for p in all_white_males
                                   if self.can_pair(player, p) and self.can_play(p, target_max)]
                    if male_partners:
                        random.shuffle(male_partners)
                        for partner in male_partners:
                            team2 = (partner, player)
                            opponents = [(m, f) for m in all_blue_males for f in all_blue_females
                                       if self.can_pair(m, f)
                                       and self.can_face(player, m) and self.can_face(player, f)
                                       and self.can_play(m, target_max) and self.can_play(f, target_max)
                                       and self.is_balanced_match((m, f), team2)]
                            if opponents:
                                opp = random.choice(opponents)
                                match = Match('XD', opp, team2)
                                self.add_match(match)
                                break
                        else:
                            continue
                        continue

                    female_partners = [p for p in all_white_females
                                     if p != player and self.can_pair(player, p)
                                     and self.can_play(p, target_max)]
                    if female_partners:
                        random.shuffle(female_partners)
                        for partner in female_partners:
                            team2 = (player, partner)
                            opponents = [(p1, p2) for p1 in all_blue_females for p2 in all_blue_females
                                       if p1 < p2 and self.can_pair(p1, p2)
                                       and self.can_face(player, p1) and self.can_face(player, p2)
                                       and self.can_play(p1, target_max) and self.can_play(p2, target_max)
                                       and self.is_balanced_match((p1, p2), team2)]
                            if opponents:
                                opp = random.choice(opponents)
                                match = Match('WD', opp, team2)
                                self.add_match(match)
                                break
                        else:
                            continue
                        continue

        # 남자 경기 보충
        for _ in range(30):
            under_players = [p for p in all_blue_males + all_white_males
                           if self.player_games[p] < target_min]

            if not under_players:
                break

            random.shuffle(under_players)

            for player in under_players:
                if self.player_games[player] >= target_min:
                    continue

                is_blue = player in all_blue_males

                if is_blue:
                    partners = [p for p in all_blue_males
                               if p != player and self.can_pair(player, p)
                               and self.can_play(p, target_max)]
                    if not partners:
                        continue

                    random.shuffle(partners)
                    for partner in partners:
                        team1 = (player, partner)
                        opponents = [(p1, p2) for p1 in all_white_males
                                    for p2 in all_white_males
                                    if p1 < p2 and self.can_pair(p1, p2)
                                    and self.can_face(player, p1) and self.can_face(player, p2)
                                    and self.can_play(p1, target_max) and self.can_play(p2, target_max)
                                    and self.is_balanced_match(team1, (p1, p2))]
                        if opponents:
                            opp = random.choice(opponents)
                            match = Match('MD', team1, opp)
                            self.add_match(match)
                            break
                else:
                    partners = [p for p in all_white_males
                               if p != player and self.can_pair(player, p)
                               and self.can_play(p, target_max)]
                    if not partners:
                        continue

                    random.shuffle(partners)
                    for partner in partners:
                        team2 = (player, partner)
                        opponents = [(p1, p2) for p1 in all_blue_males
                                    for p2 in all_blue_males
                                    if p1 < p2 and self.can_pair(p1, p2)
                                    and self.can_face(player, p1) and self.can_face(player, p2)
                                    and self.can_play(p1, target_max) and self.can_play(p2, target_max)
                                    and self.is_balanced_match((p1, p2), team2)]
                        if opponents:
                            opp = random.choice(opponents)
                            match = Match('MD', opp, team2)
                            self.add_match(match)
                            break

    def assign_courts_and_rounds(self):
        """코트 배정 및 라운드 정하기 - 라운드별 동시 진행"""
        num_courts = 6
        random.shuffle(self.matches)
        rounds = []
        player_last_round = {}
        unassigned = self.matches[:]
        while unassigned:
            current_round = {}
            round_players = set()
            round_num = len(rounds) + 1
            for court in range(1, num_courts + 1):
                best_match = None
                best_score = -float('inf')
                for match in unassigned:
                    if match in current_round.values():
                        continue
                    players = match.get_players()
                    if any(p in round_players for p in players):
                        continue
                    score = 0
                    for p in players:
                        last_round = player_last_round.get(p, -10)
                        gap = round_num - last_round
                        if gap >= 2:
                            score += 2
                        elif gap == 1:
                            score -= 3
                    if score > best_score:
                        best_score = score
                        best_match = match
                if best_match:
                    current_round[court] = best_match
                    for p in best_match.get_players():
                        round_players.add(p)
                        player_last_round[p] = round_num
                    unassigned.remove(best_match)
                    best_match.court = court
                    best_match.round_num = round_num
            if current_round:
                rounds.append(current_round)
            elif unassigned:
                match = unassigned.pop(0)
                match.court = 1
                match.round_num = len(rounds) + 1
                rounds.append({1: match})
                for p in match.get_players():
                    player_last_round[p] = match.round_num
        self.matches.sort(key=lambda m: (m.round_num, m.court))

    def generate(self):
        """전체 대진표 생성"""
        print("1. 같은 급수 경기 생성...")
        self.generate_same_grade_matches()

        print("2. 상급자+하급자 페어 경기 생성...")
        self.generate_mixed_grade_matches()

        print("3. 여자복식 경기 생성...")
        self.generate_womens_doubles()

        print("4. 부족한 경기 채우기...")
        self.fill_remaining_games()

        print("5. 코트 및 라운드 배정...")
        self.assign_courts_and_rounds()

        print(f"\n총 {len(self.matches)}경기 생성 완료")
        return self.matches

    def get_stats(self):
        """통계 정보"""
        stats = {
            'total_matches': len(self.matches),
            'by_type': defaultdict(int),
            'by_court': defaultdict(int),
            'player_games': dict(self.player_games),
            'min_games': min(self.player_games.values()) if self.player_games else 0,
            'max_games': max(self.player_games.values()) if self.player_games else 0,
            'total_rounds': max((m.round_num for m in self.matches), default=0),
        }

        for match in self.matches:
            stats['by_type'][match.match_type] += 1
            stats['by_court'][match.court] += 1

        return stats

    def print_schedule(self):
        """대진표 출력"""
        print("\n" + "=" * 80)
        print("대진표 (라운드별)")
        print("=" * 80)

        current_round = 0
        for match in self.matches:
            if match.round_num != current_round:
                current_round = match.round_num
                print(f"\n[라운드 {current_round}]")
                print("-" * 60)

            t1 = f"{match.team1[0]} + {match.team1[1]}"
            t2 = f"{match.team2[0]} + {match.team2[1]}"
            type_name = {'MD': '남복', 'WD': '여복', 'XD': '혼복'}[match.match_type]
            print(f"  코트{match.court}. [{type_name}] 청({t1}) vs 백({t2})")

        # 통계
        stats = self.get_stats()
        print("\n" + "=" * 80)
        print("통계")
        print("=" * 80)
        print(f"총 경기 수: {stats['total_matches']}")
        print(f"경기 종류: 남복 {stats['by_type']['MD']}, 여복 {stats['by_type']['WD']}, 혼복 {stats['by_type']['XD']}")
        print(f"코트별: {dict(stats['by_court'])}")
        print(f"개인 경기 수: 최소 {stats['min_games']}, 최대 {stats['max_games']}")


if __name__ == '__main__':
    scheduler = MatchScheduler()
    scheduler.generate()
    scheduler.print_schedule()
