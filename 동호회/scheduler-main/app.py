# -*- coding: utf-8 -*-
"""
배드민턴 대진표 웹서버
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from scheduler import MatchScheduler
from players import MALE_PLAYERS, FEMALE_PLAYERS, assign_teams, get_all_players_with_team
import json

app = Flask(__name__)
CORS(app)

# 전역 스케줄러
scheduler = None


def get_scheduler():
    global scheduler
    if scheduler is None:
        scheduler = MatchScheduler()
        scheduler.generate()
    return scheduler


@app.route('/')
def index():
    """메인 페이지"""
    return render_template('index.html')


@app.route('/api/players')
def api_players():
    """선수 목록"""
    players = get_all_players_with_team()
    blue, white = assign_teams()

    return jsonify({
        'success': True,
        'players': players,
        'summary': {
            'total': len(players),
            'male': sum(len(v) for v in MALE_PLAYERS.values()),
            'female': sum(len(v) for v in FEMALE_PLAYERS.values()),
            'blue_male': len(blue['male']),
            'blue_female': len(blue['female']),
            'white_male': len(white['male']),
            'white_female': len(white['female']),
        }
    })


@app.route('/api/schedule')
def api_schedule():
    """대진표"""
    sched = get_scheduler()

    matches = []
    for m in sched.matches:
        matches.append({
            'court': m.court,
            'round': m.round_num,
            'type': m.match_type,
            'type_name': {'MD': '남자복식', 'WD': '여자복식', 'XD': '혼합복식'}[m.match_type],
            'team1': list(m.team1),
            'team2': list(m.team2),
        })

    stats = sched.get_stats()

    return jsonify({
        'success': True,
        'matches': matches,
        'stats': {
            'total': stats['total_matches'],
            'total_rounds': stats['total_rounds'],
            'by_type': dict(stats['by_type']),
            'by_court': dict(stats['by_court']),
            'min_games': stats['min_games'],
            'max_games': stats['max_games'],
        },
        'player_games': stats['player_games']
    })


@app.route('/api/regenerate', methods=['POST'])
def api_regenerate():
    """대진표 재생성"""
    global scheduler
    scheduler = MatchScheduler()
    scheduler.generate()

    return jsonify({'success': True, 'message': '대진표가 재생성되었습니다.'})


@app.route('/api/player/<player_id>')
def api_player_detail(player_id):
    """선수별 경기 목록"""
    sched = get_scheduler()

    player_matches = []
    for m in sched.matches:
        if player_id in m.get_players():
            # 이 선수가 청팀인지 백팀인지
            if player_id in m.team1:
                team = '청'
                partner = m.team1[0] if m.team1[1] == player_id else m.team1[1]
                opponents = list(m.team2)
            else:
                team = '백'
                partner = m.team2[0] if m.team2[1] == player_id else m.team2[1]
                opponents = list(m.team1)

            player_matches.append({
                'court': m.court,
                'round': m.round_num,
                'type': m.match_type,
                'type_name': {'MD': '남자복식', 'WD': '여자복식', 'XD': '혼합복식'}[m.match_type],
                'team': team,
                'partner': partner,
                'opponents': opponents,
            })

    # 라운드 순서로 정렬 (빠른 순서부터)
    player_matches.sort(key=lambda x: x['round'])

    return jsonify({
        'success': True,
        'player_id': player_id,
        'total_games': len(player_matches),
        'matches': player_matches
    })


if __name__ == '__main__':
    print("=" * 60)
    print("배드민턴 대진표 웹서버")
    print("=" * 60)
    print("http://localhost:7000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=7000, debug=True)
