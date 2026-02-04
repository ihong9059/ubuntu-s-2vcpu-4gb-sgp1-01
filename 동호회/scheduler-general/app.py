# -*- coding: utf-8 -*-
"""
일반화된 배드민턴 대진표 웹서버
"""

from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from scheduler import DynamicScheduler, Player
import json

app = Flask(__name__)
CORS(app)

# 전역 상태
current_scheduler = None
current_players = []


@app.route('/')
def index():
    """메인 페이지"""
    return render_template('index.html')


@app.route('/api/generate', methods=['POST'])
def api_generate():
    """대진표 생성"""
    global current_scheduler, current_players

    try:
        data = request.get_json()
        num_courts = int(data.get('num_courts', 6))
        players_data = data.get('players', [])

        # 선수 객체 생성
        current_players = []
        for p in players_data:
            player = Player(
                name=p['name'],
                gender=p['gender'],
                grade=p['grade'],
                team=p['team']
            )
            current_players.append(player)

        if len(current_players) < 8:
            return jsonify({
                'success': False,
                'error': '최소 8명의 선수가 필요합니다.'
            })

        # 스케줄러 생성 및 대진표 생성
        current_scheduler = DynamicScheduler(current_players, num_courts)
        current_scheduler.generate()

        return jsonify({
            'success': True,
            'message': f'대진표가 생성되었습니다. (총 {len(current_scheduler.matches)}경기)'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })


@app.route('/api/schedule')
def api_schedule():
    """대진표 조회"""
    global current_scheduler

    if current_scheduler is None:
        return jsonify({
            'success': False,
            'error': '대진표가 생성되지 않았습니다.'
        })

    matches = []
    for m in current_scheduler.matches:
        matches.append({
            'court': m.court,
            'round': m.round_num,
            'type': m.match_type,
            'type_name': {'MD': '남자복식', 'WD': '여자복식', 'XD': '혼합복식'}[m.match_type],
            'team1': list(m.team1),
            'team2': list(m.team2),
        })

    stats = current_scheduler.get_stats()

    return jsonify({
        'success': True,
        'matches': matches,
        'stats': {
            'total': stats['total_matches'],
            'by_type': stats['by_type'],
            'by_court': stats['by_court'],
            'min_games': stats['min_games'],
            'max_games': stats['max_games'],
            'target_min': stats['target_min'],
            'target_max': stats['target_max'],
            'total_rounds': stats.get('total_rounds', 0),
        },
        'player_games': stats['player_games']
    })


@app.route('/api/regenerate', methods=['POST'])
def api_regenerate():
    """대진표 재생성"""
    global current_scheduler

    if current_scheduler is None:
        return jsonify({
            'success': False,
            'error': '먼저 선수를 입력하고 대진표를 생성하세요.'
        })

    current_scheduler.generate()

    return jsonify({
        'success': True,
        'message': '대진표가 재생성되었습니다.'
    })


@app.route('/api/player/<player_name>')
def api_player_detail(player_name):
    """선수별 경기 목록"""
    global current_scheduler

    if current_scheduler is None:
        return jsonify({
            'success': False,
            'error': '대진표가 생성되지 않았습니다.'
        })

    player_matches = []
    for m in current_scheduler.matches:
        if player_name in m.get_players():
            if player_name in m.team1:
                team = '청'
                partner = m.team1[0] if m.team1[1] == player_name else m.team1[1]
                opponents = list(m.team2)
            else:
                team = '백'
                partner = m.team2[0] if m.team2[1] == player_name else m.team2[1]
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

    # 라운드 순서로 정렬
    player_matches.sort(key=lambda x: x['round'])

    return jsonify({
        'success': True,
        'player_name': player_name,
        'total_games': len(player_matches),
        'matches': player_matches
    })


@app.route('/api/players')
def api_players():
    """선수 목록"""
    global current_players

    players = []
    for p in current_players:
        players.append({
            'name': p.name,
            'gender': p.gender,
            'grade': p.grade,
            'team': p.team
        })

    return jsonify({
        'success': True,
        'players': players,
        'summary': {
            'total': len(players),
            'male': len([p for p in players if p['gender'] == 'M']),
            'female': len([p for p in players if p['gender'] == 'F']),
            'blue': len([p for p in players if p['team'] == 'blue']),
            'white': len([p for p in players if p['team'] == 'white']),
        }
    })


if __name__ == '__main__':
    print("=" * 60)
    print("배드민턴 대진표 생성기 (일반화 버전)")
    print("=" * 60)
    print("http://localhost:7001")
    print("=" * 60)
    app.run(host='0.0.0.0', port=7001, debug=True)
