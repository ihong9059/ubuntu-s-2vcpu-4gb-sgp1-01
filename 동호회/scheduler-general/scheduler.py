# -*- coding: utf-8 -*-
"""
배드민턴 대진표 스케줄러 - 경기 수 균형 최우선
"""

import random
from dataclasses import dataclass
from typing import List, Dict, Set, Tuple
from collections import defaultdict

GRADE_SCORE = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1}


@dataclass
class Player:
    name: str
    gender: str
    grade: str
    team: str


@dataclass
class Match:
    match_type: str
    team1: Tuple[str, str]
    team2: Tuple[str, str]
    court: int = 0
    round_num: int = 0

    def get_players(self) -> Set[str]:
        return {self.team1[0], self.team1[1], self.team2[0], self.team2[1]}


class DynamicScheduler:

    def __init__(self, players: List[Player], num_courts: int = 6):
        self.players = players
        self.num_courts = num_courts
        self.matches: List[Match] = []

        self.blue_males = [p for p in players if p.team == 'blue' and p.gender == 'M']
        self.blue_females = [p for p in players if p.team == 'blue' and p.gender == 'F']
        self.white_males = [p for p in players if p.team == 'white' and p.gender == 'M']
        self.white_females = [p for p in players if p.team == 'white' and p.gender == 'F']

        self.player_games: Dict[str, int] = defaultdict(int)
        self.player_by_name: Dict[str, Player] = {p.name: p for p in players}

        total = len(self.players)
        if total <= 20:
            self.min_games = 3
            self.max_games = 4
        elif total <= 40:
            self.min_games = 4
            self.max_games = 5
        else:
            self.min_games = 4
            self.max_games = 5

    def _get_team_score(self, team: Tuple[str, str]) -> int:
        score = 0
        for name in team:
            p = self.player_by_name.get(name)
            if p:
                score += GRADE_SCORE.get(p.grade, 3)
        return score

    def _is_balanced(self, t1: Tuple[str, str], t2: Tuple[str, str], max_diff: int) -> bool:
        return abs(self._get_team_score(t1) - self._get_team_score(t2)) <= max_diff

    def _add_match(self, match: Match):
        self.matches.append(match)
        for p in match.get_players():
            self.player_games[p] += 1

    def _sort_by_games(self, players: List[Player]) -> List[Player]:
        shuffled = players.copy()
        random.shuffle(shuffled)
        return sorted(shuffled, key=lambda p: self.player_games[p.name])

    def _get_min_max(self):
        games = [self.player_games[p.name] for p in self.players]
        return min(games), max(games)

    def generate(self):
        self.matches = []
        self.player_games = {p.name: 0 for p in self.players}

        # 모든 선수가 min_games에 도달할 때까지 반복
        for _ in range(300):
            min_g, max_g = self._get_min_max()
            
            if min_g >= self.min_games:
                break
            
            # 경기 수가 가장 적은 선수 찾기
            under_players = [p for p in self.players if self.player_games[p.name] == min_g]
            
            if not under_players:
                break
            
            # 경기 추가 시도 (실력 제한 점점 완화)
            added = False
            for max_diff in [1, 2, 3, 5, 10]:
                # max_games 제한도 점점 완화
                for extra_games in [0, 1, 2]:
                    added = self._try_add_for_under(under_players, max_diff, extra_games)
                    if added:
                        break
                if added:
                    break
            
            if not added:
                break

        self._assign_courts()
        return self.matches

    def _try_add_for_under(self, under_players: List[Player], max_diff: int, extra_games: int) -> bool:
        """경기 수 부족한 선수에게 경기 추가"""
        effective_max = self.max_games + extra_games
        random.shuffle(under_players)
        
        for player in under_players:
            if self.player_games[player.name] >= self.min_games:
                continue
            
            is_male = player.gender == 'M'
            is_blue = player.team == 'blue'
            
            if is_male:
                if is_blue:
                    added = self._try_md(player.name, self.blue_males, self.white_males, True, max_diff, effective_max)
                    if not added:
                        added = self._try_xd_m(player.name, self.blue_females, self.white_males, self.white_females, True, max_diff, effective_max)
                else:
                    added = self._try_md(player.name, self.white_males, self.blue_males, False, max_diff, effective_max)
                    if not added:
                        added = self._try_xd_m(player.name, self.white_females, self.blue_males, self.blue_females, False, max_diff, effective_max)
            else:
                if is_blue:
                    added = self._try_xd_f(player.name, self.blue_males, self.white_males, self.white_females, True, max_diff, effective_max)
                    if not added:
                        added = self._try_wd(player.name, self.blue_females, self.white_females, True, max_diff, effective_max)
                else:
                    added = self._try_xd_f(player.name, self.white_males, self.blue_males, self.blue_females, False, max_diff, effective_max)
                    if not added:
                        added = self._try_wd(player.name, self.white_females, self.blue_females, False, max_diff, effective_max)
            
            if added:
                return True
        
        return False

    def _try_md(self, player: str, same: List[Player], opp: List[Player], is_blue: bool, max_diff: int, eff_max: int) -> bool:
        partners = self._sort_by_games([p for p in same if p.name != player and self.player_games[p.name] < eff_max])
        
        for partner in partners:
            t1 = (player, partner.name)
            opps = self._sort_by_games([p for p in opp if self.player_games[p.name] < eff_max])
            
            for i, o1 in enumerate(opps):
                for o2 in opps[i+1:]:
                    t2 = (o1.name, o2.name)
                    if self._is_balanced(t1, t2, max_diff):
                        self._add_match(Match('MD', t1, t2) if is_blue else Match('MD', t2, t1))
                        return True
        return False

    def _try_wd(self, player: str, same: List[Player], opp: List[Player], is_blue: bool, max_diff: int, eff_max: int) -> bool:
        partners = self._sort_by_games([p for p in same if p.name != player and self.player_games[p.name] < eff_max])
        
        for partner in partners:
            t1 = (player, partner.name)
            opps = self._sort_by_games([p for p in opp if self.player_games[p.name] < eff_max])
            
            for i, o1 in enumerate(opps):
                for o2 in opps[i+1:]:
                    t2 = (o1.name, o2.name)
                    if self._is_balanced(t1, t2, max_diff):
                        self._add_match(Match('WD', t1, t2) if is_blue else Match('WD', t2, t1))
                        return True
        return False

    def _try_xd_m(self, player: str, same_f: List[Player], opp_m: List[Player], opp_f: List[Player], is_blue: bool, max_diff: int, eff_max: int) -> bool:
        partners = self._sort_by_games([p for p in same_f if self.player_games[p.name] < eff_max])
        
        for fp in partners:
            t1 = (player, fp.name)
            opp_males = self._sort_by_games([p for p in opp_m if self.player_games[p.name] < eff_max])
            opp_females = self._sort_by_games([p for p in opp_f if self.player_games[p.name] < eff_max])
            
            for om in opp_males:
                for of in opp_females:
                    t2 = (om.name, of.name)
                    if self._is_balanced(t1, t2, max_diff):
                        self._add_match(Match('XD', t1, t2) if is_blue else Match('XD', t2, t1))
                        return True
        return False

    def _try_xd_f(self, player: str, same_m: List[Player], opp_m: List[Player], opp_f: List[Player], is_blue: bool, max_diff: int, eff_max: int) -> bool:
        partners = self._sort_by_games([p for p in same_m if self.player_games[p.name] < eff_max])
        
        for mp in partners:
            t1 = (mp.name, player)
            opp_males = self._sort_by_games([p for p in opp_m if self.player_games[p.name] < eff_max])
            opp_females = self._sort_by_games([p for p in opp_f if self.player_games[p.name] < eff_max])
            
            for om in opp_males:
                for of in opp_females:
                    t2 = (om.name, of.name)
                    if self._is_balanced(t1, t2, max_diff):
                        self._add_match(Match('XD', t1, t2) if is_blue else Match('XD', t2, t1))
                        return True
        return False

    def _assign_courts(self):
        random.shuffle(self.matches)
        rounds = []
        player_last = {}
        unassigned = self.matches[:]

        while unassigned:
            current = {}
            round_players = set()
            rnum = len(rounds) + 1

            for court in range(1, self.num_courts + 1):
                best = None
                best_score = -float('inf')

                for m in unassigned:
                    if m in current.values():
                        continue
                    ps = m.get_players()
                    if any(p in round_players for p in ps):
                        continue

                    score = sum(2 if rnum - player_last.get(p, -10) >= 2 else -3 if rnum - player_last.get(p, -10) == 1 else 0 for p in ps)
                    if score > best_score:
                        best_score = score
                        best = m

                if best:
                    current[court] = best
                    for p in best.get_players():
                        round_players.add(p)
                        player_last[p] = rnum
                    unassigned.remove(best)
                    best.court = court
                    best.round_num = rnum

            if current:
                rounds.append(current)
            elif unassigned:
                m = unassigned.pop(0)
                rnum = len(rounds) + 1
                m.court = 1
                m.round_num = rnum
                for p in m.get_players():
                    player_last[p] = rnum
                rounds.append({1: m})

        self.matches.sort(key=lambda m: (m.round_num, m.court))

    def get_stats(self) -> Dict:
        by_type = defaultdict(int)
        by_court = defaultdict(int)

        for m in self.matches:
            by_type[m.match_type] += 1
            by_court[m.court] += 1

        games = [self.player_games[p.name] for p in self.players]

        return {
            'total_matches': len(self.matches),
            'by_type': dict(by_type),
            'by_court': dict(by_court),
            'player_games': dict(self.player_games),
            'min_games': min(games) if games else 0,
            'max_games': max(games) if games else 0,
            'target_min': self.min_games,
            'target_max': self.max_games,
            'total_rounds': max((m.round_num for m in self.matches), default=0),
        }
