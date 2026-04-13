"""
Test script for the session reporting system.
Run this to verify all modules work correctly without needing video processing.
"""
import json
from datetime import datetime, timedelta
from session_tracker import SessionTracker
from mistake_classifier import MistakeClassifier
from report_generator import ReportGenerator


def test_mistake_classifier():
    """Test the mistake classifier."""
    print("\n" + "="*60)
    print("TEST 1: Mistake Classifier")
    print("="*60)
    
    test_cases = [
        ("Bad Form: Knees too far past toes", "squat"),
        ("Bad Form: Straighten your back", "push_up"),
        ("Good Form", "squat"),
        ("Bad Form: Don't pull your neck forward", "sit_up"),
        ("Bad Form: Keep chest up (too much forward lean)", "squat"),
    ]
    
    for feedback, exercise in test_cases:
        mistake_type, message, severity = MistakeClassifier.classify_feedback(
            feedback, exercise
        )
        
        print(f"\nFeedback: {feedback}")
        print(f"Exercise: {exercise}")
        print(f"→ Type: {mistake_type}")
        print(f"→ Message: {message}")
        print(f"→ Severity: {severity}")
        
        if mistake_type:
            correction = MistakeClassifier.get_correction_tip(mistake_type)
            injury_risk = MistakeClassifier.get_injury_risk(mistake_type)
            print(f"→ Correction: {correction[:60]}...")
            print(f"→ Injury Risk: {injury_risk}")
    
    print("\n✅ Mistake Classifier Test Passed!")


def test_session_tracker():
    """Test the session tracker."""
    print("\n" + "="*60)
    print("TEST 2: Session Tracker")
    print("="*60)
    
    tracker = SessionTracker(
        session_id="test_session_001",
        user_id="test_user_123"
    )
    
    tracker.start_session("Test Squat Session")
    print(f"\n✓ Session started: {tracker.session_id}")
    
    # Simulate mistakes
    mistakes_to_record = [
        (10.5, 315, "squat", "knees_past_toes", "Knees too far past toes", "high"),
        (25.3, 759, "squat", "forward_lean", "Keep chest up", "high"),
        (42.1, 1263, "squat", "knees_past_toes", "Knees too far past toes", "high"),
        (58.7, 1761, "squat", "knees_past_toes", "Knees too far past toes", "high"),
        (75.2, 2256, "squat", "rounded_back", "Avoid rounding", "high"),
        (91.8, 2754, "squat", "knees_past_toes", "Knees too far past toes", "high"),
        (108.4, 3252, "squat", "knees_past_toes", "Knees too far past toes", "high"),
        (125.0, 3750, "squat", "forward_lean", "Keep chest up", "high"),
        (141.6, 4248, "squat", "knees_past_toes", "Knees too far past toes", "high"),
    ]
    
    for timestamp, frame, exercise, m_type, message, severity in mistakes_to_record:
        tracker.record_mistake(timestamp, frame, exercise, m_type, message, severity)
        tracker.increment_frame_count()
    
    print(f"✓ Recorded {len(mistakes_to_record)} mistakes")
    
    # Add some frames without mistakes
    for _ in range(100):
        tracker.increment_frame_count()
    
    tracker.end_session()
    print(f"✓ Session ended")
    
    # Get summary
    summary = tracker.get_session_summary()
    print(f"\nSession Summary:")
    print(f"  Total Mistakes: {summary['total_mistakes']}")
    print(f"  Total Frames: {summary['total_frames_processed']}")
    print(f"  Exercise: {summary['exercise_detected']}")
    print(f"  Duration: {summary['duration_seconds']:.2f}s")
    
    frequency = tracker.get_mistake_frequency()
    print(f"\nMistake Frequency:")
    for mistake_type, count in frequency.items():
        print(f"  {mistake_type}: {count}x")
    
    high_freq = tracker.get_high_frequency_mistakes()
    print(f"\nHigh Frequency Mistakes: {high_freq}")
    
    print("\n✅ Session Tracker Test Passed!")
    
    return summary


def test_report_generator(session_data):
    """Test the report generator."""
    print("\n" + "="*60)
    print("TEST 3: Report Generator")
    print("="*60)
    
    # Generate full report
    report = ReportGenerator.generate_report(session_data)
    
    print("\nReport Generated:")
    print(f"  Session: {report['session_info']['session_name']}")
    print(f"  Performance: {report['overall_summary']['performance_rating']}")
    print(f"  Total Mistakes: {report['statistics']['total_mistakes']}")
    print(f"  Unique Types: {report['statistics']['unique_mistake_types']}")
    print(f"  High Risk Warnings: {report['overall_summary']['high_risk_warnings']}")
    
    print("\nMistakes Breakdown:")
    for i, mistake in enumerate(report['mistakes'], 1):
        print(f"\n  {i}. {mistake['mistake_message']}")
        print(f"     Count: {mistake['count']}x")
        print(f"     Severity: {mistake['severity']}")
        print(f"     First: {mistake['first_seen_at']} | Last: {mistake['last_seen_at']}")
        
        if mistake.get('warning'):
            print(f"     ⚠️  Warning Level: {mistake['warning']['level']}")
        
        print(f"     💡 Tip: {mistake['correction_tip'][:60]}...")
    
    # Generate quick summary
    quick_summary = ReportGenerator.generate_quick_summary(session_data)
    print(f"\nQuick Summary:")
    print(f"  {quick_summary}")
    
    print("\n✅ Report Generator Test Passed!")
    
    return report


def test_full_pipeline():
    """Test the complete pipeline with realistic data."""
    print("\n" + "="*60)
    print("TEST 4: Full Pipeline Integration")
    print("="*60)
    
    # Initialize tracker
    tracker = SessionTracker(
        session_id=f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        user_id="user_456"
    )
    tracker.start_session("Full Pipeline Test - Squat Session")
    
    # Simulate video processing with form feedback
    feedback_sequence = [
        (5.0, "Good Form", "squat"),
        (10.0, "Bad Form: Knees too far past toes", "squat"),
        (15.0, "Good Form", "squat"),
        (20.0, "Bad Form: Knees too far past toes", "squat"),
        (25.0, "Bad Form: Keep chest up (too much forward lean)", "squat"),
        (30.0, "Good Form", "squat"),
        (35.0, "Bad Form: Knees too far past toes", "squat"),
        (40.0, "Bad Form: Avoid rounding (keep back neutral)", "squat"),
        (45.0, "Good Form", "squat"),
        (50.0, "Bad Form: Knees too far past toes", "squat"),
        (55.0, "Bad Form: Knees too far past toes", "squat"),
        (60.0, "Good Form", "squat"),
        (65.0, "Bad Form: Knees too far past toes", "squat"),
        (70.0, "Bad Form: Keep chest up (too much forward lean)", "squat"),
        (75.0, "Good Form", "squat"),
        (80.0, "Bad Form: Knees too far past toes", "squat"),
    ]
    
    frame_number = 0
    for timestamp, feedback, exercise in feedback_sequence:
        # Classify feedback
        mistake_type, message, severity = MistakeClassifier.classify_feedback(
            feedback, exercise
        )
        
        # Record if it's a mistake
        if mistake_type:
            tracker.record_mistake(
                timestamp=timestamp,
                frame_number=frame_number,
                exercise_type=exercise,
                mistake_type=mistake_type,
                mistake_message=message,
                severity=severity
            )
        
        tracker.increment_frame_count()
        frame_number += 1
    
    # End session
    tracker.end_session()
    
    # Generate report
    session_data = tracker.get_session_summary()
    report = ReportGenerator.generate_report(session_data)
    
    print("\n✓ Pipeline completed successfully!")
    print(f"\nFinal Report:")
    print(f"  Performance: {report['overall_summary']['performance_rating'].upper()}")
    print(f"  Message: {report['overall_summary']['message']}")
    print(f"  Total Mistakes: {report['statistics']['total_mistakes']}")
    print(f"  Most Common: {report['statistics']['most_common_mistake']}")
    
    print("\n✅ Full Pipeline Test Passed!")
    
    return report


def save_test_report(report, filename="test_report_output.json"):
    """Save test report to file."""
    with open(filename, 'w') as f:
        json.dump(report, f, indent=2)
    print(f"\n✅ Test report saved to: {filename}")


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("SESSION REPORTING SYSTEM - TEST SUITE")
    print("="*60)
    
    try:
        # Test 1: Mistake Classifier
        test_mistake_classifier()
        
        # Test 2: Session Tracker
        session_data = test_session_tracker()
        
        # Test 3: Report Generator
        report = test_report_generator(session_data)
        
        # Test 4: Full Pipeline
        full_report = test_full_pipeline()
        
        # Save test report
        save_test_report(full_report)
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\nThe session reporting system is working correctly.")
        print("You can now integrate it with your main application.")
        print("\nNext steps:")
        print("1. Review test_report_output.json")
        print("2. Run main_with_reporting.py with a video")
        print("3. Integrate with your FastAPI backend")
        print("4. Create frontend components for report display")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
