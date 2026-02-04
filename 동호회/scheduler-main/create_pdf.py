# -*- coding: utf-8 -*-
"""
인원배치 마크다운을 PDF로 변환
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# 한글 폰트 등록 (Windows)
font_paths = [
    "C:/Windows/Fonts/malgun.ttf",      # 맑은 고딕
    "C:/Windows/Fonts/gulim.ttc",        # 굴림
    "C:/Windows/Fonts/batang.ttc",       # 바탕
]

font_registered = False
for font_path in font_paths:
    if os.path.exists(font_path):
        try:
            pdfmetrics.registerFont(TTFont('Korean', font_path))
            font_registered = True
            print(f"폰트 등록: {font_path}")
            break
        except:
            continue

if not font_registered:
    print("경고: 한글 폰트를 찾을 수 없습니다.")

# PDF 생성
output_path = "C:/todo/today/동호회/인원배치.pdf"
doc = SimpleDocTemplate(output_path, pagesize=A4,
                        rightMargin=20*mm, leftMargin=20*mm,
                        topMargin=20*mm, bottomMargin=20*mm)

# 스타일 설정
styles = getSampleStyleSheet()

# 한글 스타일
title_style = ParagraphStyle(
    'KoreanTitle',
    parent=styles['Title'],
    fontName='Korean' if font_registered else 'Helvetica',
    fontSize=24,
    spaceAfter=20,
    alignment=1  # 가운데 정렬
)

heading_style = ParagraphStyle(
    'KoreanHeading',
    parent=styles['Heading1'],
    fontName='Korean' if font_registered else 'Helvetica',
    fontSize=16,
    spaceBefore=15,
    spaceAfter=10,
    textColor=colors.darkblue
)

heading2_style = ParagraphStyle(
    'KoreanHeading2',
    parent=styles['Heading2'],
    fontName='Korean' if font_registered else 'Helvetica',
    fontSize=13,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.darkgreen
)

normal_style = ParagraphStyle(
    'KoreanNormal',
    parent=styles['Normal'],
    fontName='Korean' if font_registered else 'Helvetica',
    fontSize=10,
    spaceAfter=6
)

# 테이블 스타일
table_style = TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4472C4')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ('FONTNAME', (0, 0), (-1, -1), 'Korean' if font_registered else 'Helvetica'),
    ('FONTSIZE', (0, 0), (-1, 0), 11),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
    ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#D6DCE5')),
    ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#E9EBF5')]),
])

# 내용 생성
story = []

# 제목
story.append(Paragraph("배드민턴 동호회 인원 배치", title_style))
story.append(Spacer(1, 10))

# 개요
story.append(Paragraph("개요", heading_style))
overview_data = [
    ['항목', '내용'],
    ['총 인원', '50명 (남자 35명, 여자 15명)'],
    ['급수', 'A, B, C, D, E (5등급)'],
    ['팀 구성', '청팀 25명, 백팀 25명'],
]
t = Table(overview_data, colWidths=[80, 300])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 15))

# 남자 배치
story.append(Paragraph("남자 35명", heading_style))
male_data = [
    ['급수', '인원', '청팀', '백팀'],
    ['A급', '4명', '남A1, 남A2', '남A3, 남A4'],
    ['B급', '7명', '남B1, 남B2, 남B3, 남B4', '남B5, 남B6, 남B7'],
    ['C급', '12명', '남C1~남C6', '남C7~남C12'],
    ['D급', '8명', '남D1~남D4', '남D5~남D8'],
    ['E급', '4명', '남E1, 남E2', '남E3, 남E4'],
    ['합계', '35명', '18명', '17명'],
]
t = Table(male_data, colWidths=[50, 50, 150, 150])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 15))

# 여자 배치
story.append(Paragraph("여자 15명", heading_style))
female_data = [
    ['급수', '인원', '청팀', '백팀'],
    ['A급', '2명', '여A1', '여A2'],
    ['B급', '3명', '여B1', '여B2, 여B3'],
    ['C급', '5명', '여C1, 여C2, 여C3', '여C4, 여C5'],
    ['D급', '3명', '여D1', '여D2, 여D3'],
    ['E급', '2명', '여E1', '여E2'],
    ['합계', '15명', '7명', '8명'],
]
t = Table(female_data, colWidths=[50, 50, 150, 150])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 15))

# 팀별 요약
story.append(Paragraph("팀별 요약", heading_style))
summary_data = [
    ['팀', '남자', '여자', '합계'],
    ['청팀', '18명', '7명', '25명'],
    ['백팀', '17명', '8명', '25명'],
    ['전체', '35명', '15명', '50명'],
]
t = Table(summary_data, colWidths=[80, 80, 80, 80])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 20))

# 청팀 상세
story.append(Paragraph("청팀 상세 (25명)", heading_style))
story.append(Paragraph("남자 18명", heading2_style))
blue_male_data = [
    ['급수', '선수'],
    ['A급', '남A1, 남A2'],
    ['B급', '남B1, 남B2, 남B3, 남B4'],
    ['C급', '남C1, 남C2, 남C3, 남C4, 남C5, 남C6'],
    ['D급', '남D1, 남D2, 남D3, 남D4'],
    ['E급', '남E1, 남E2'],
]
t = Table(blue_male_data, colWidths=[50, 350])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 10))

story.append(Paragraph("여자 7명", heading2_style))
blue_female_data = [
    ['급수', '선수'],
    ['A급', '여A1'],
    ['B급', '여B1'],
    ['C급', '여C1, 여C2, 여C3'],
    ['D급', '여D1'],
    ['E급', '여E1'],
]
t = Table(blue_female_data, colWidths=[50, 350])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 15))

# 백팀 상세
story.append(Paragraph("백팀 상세 (25명)", heading_style))
story.append(Paragraph("남자 17명", heading2_style))
white_male_data = [
    ['급수', '선수'],
    ['A급', '남A3, 남A4'],
    ['B급', '남B5, 남B6, 남B7'],
    ['C급', '남C7, 남C8, 남C9, 남C10, 남C11, 남C12'],
    ['D급', '남D5, 남D6, 남D7, 남D8'],
    ['E급', '남E3, 남E4'],
]
t = Table(white_male_data, colWidths=[50, 350])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 10))

story.append(Paragraph("여자 8명", heading2_style))
white_female_data = [
    ['급수', '선수'],
    ['A급', '여A2'],
    ['B급', '여B2, 여B3'],
    ['C급', '여C4, 여C5'],
    ['D급', '여D2, 여D3'],
    ['E급', '여E2'],
]
t = Table(white_female_data, colWidths=[50, 350])
t.setStyle(table_style)
story.append(t)
story.append(Spacer(1, 20))

# 경기 조건
story.append(Paragraph("경기 조건", heading_style))
conditions_data = [
    ['항목', '내용'],
    ['경기 종류', '남자복식, 여자복식, 혼합복식'],
    ['1인당 경기 수', '4~5게임'],
    ['같은 급수 페어', '남복 1게임 + 혼복 1게임'],
    ['상급자+하급자 페어', '남복 1게임 + 혼복 1게임'],
    ['여성', '여복 1게임 + 혼복 1게임'],
    ['제약 조건', '상대/파트너 중복 금지, 연속 경기 피하기'],
    ['코트 수', '6개'],
    ['코트당 경기 수', '10~12게임'],
    ['총 예상 경기 수', '60~72게임'],
]
t = Table(conditions_data, colWidths=[120, 280])
t.setStyle(table_style)
story.append(t)

# 생성일
story.append(Spacer(1, 30))
story.append(Paragraph("생성일: 2026-02-01", normal_style))

# PDF 생성
doc.build(story)
print(f"\nPDF 생성 완료: {output_path}")
