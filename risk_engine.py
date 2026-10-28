# ============================================================
# NightGuard AI - Risk Engine
# ============================================================

from config import LINE_CONFIG


# ------------------------------------------------------------
# Base risk weights
# ------------------------------------------------------------

RISK_WEIGHTS = {
    "zone_entry": 40,
    "zone_exit": 10,
    "line_crossing": 35,
    "loitering": 50,
    "wall_climbing": 70
}


# ------------------------------------------------------------
# Convert score into risk level
# ------------------------------------------------------------

def get_risk_level(score):

    if score >= 60:
        return "HIGH"

    elif score >= 30:
        return "MEDIUM"

    else:
        return "LOW"


# ------------------------------------------------------------
# Assess event risk
# ------------------------------------------------------------

def assess_risk(event):

    event_type = event.get("event_type")

    confidence = event.get("confidence", 0)


    # Unknown event

    if event_type not in RISK_WEIGHTS:

        return {
            "risk_score": 0,
            "risk_level": "LOW",
            "reason": "Unknown event type"
        }


    # Base score

    base_score = RISK_WEIGHTS[event_type]


    # Confidence contribution

    confidence_score = confidence * 30


    # Final score

    risk_score = min(
        base_score + confidence_score,
        100
    )


    # Risk level

    risk_level = get_risk_level(risk_score)


    # --------------------------------------------------------
    # Explanation
    # --------------------------------------------------------

    if event_type == "line_crossing":

        direction = event.get("direction", "unknown")

        if direction == "A -> B":
            movement = LINE_CONFIG["a_to_b"]

        elif direction == "B -> A":
            movement = LINE_CONFIG["b_to_a"]

        else:
            movement = "unknown"

        reason = (
            f"Person crossed "
            f"{LINE_CONFIG['name']} "
            f"({movement})"
        )

    elif event_type == "zone_entry":

        reason = "Person entered a monitored zone"

    elif event_type == "zone_exit":

        reason = "Person exited a monitored zone"

    elif event_type == "loitering":

        reason = "Person remained in the monitored area for an extended duration"

    elif event_type == "wall_climbing":

        reason = "Possible wall-climbing activity detected"

    else:

        reason = "Event detected"


    return {
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "reason": reason
    }


# ------------------------------------------------------------
# Test
# ------------------------------------------------------------

if __name__ == "__main__":

    test_event = {
        "event_type": "wall_climbing",
        "track_id": 7,
        "confidence": 0.90,
        "direction": "B -> A"
    }

    result = assess_risk(test_event)

    print("Event:")
    print(test_event)

    print("\nRisk Assessment:")
    print(result)