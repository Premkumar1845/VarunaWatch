from app.engines.risk import compute_risk, band, W

def test_extreme():
    s, b = compute_risk(100, 100, 100, 100, 100)
    assert s == 100.0
    assert b == "Extreme"

def test_low():
    s, b = compute_risk(10, 10, 10, 10, 10)
    assert s == 10.0
    assert b == "Low"

def test_weights_sum():
    assert abs(sum(W.values()) - 1.0) < 1e-9

def test_band_edges():
    assert band(20) == "Low"
    assert band(21) == "Moderate"
    assert band(40) == "Moderate"
    assert band(41) == "High"
    assert band(60) == "High"
    assert band(61) == "Very High"
    assert band(80) == "Very High"
    assert band(81) == "Extreme"

def test_custom_combination():
    # Flood 85*0.30(25.5) + Rain 78*0.20(15.6) + Wind 80*0.15(12.0) + Surge 72*0.15(10.8) + Vuln 75*0.20(15.0) = 78.9
    s, b = compute_risk(85, 78, 80, 72, 75)
    assert s == 78.9
    assert b == "Very High"
