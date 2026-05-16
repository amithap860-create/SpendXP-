import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BugReport {
  title: string;
  description: string;
  email?: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  try {
    const bugReport: BugReport = await request.json();

    // Validate required fields
    if (!bugReport.title?.trim() || !bugReport.description?.trim()) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Log the bug report (in production, you'd send this to a bug tracking system)
    const logEntry = {
      timestamp: new Date().toISOString(),
      title: bugReport.title.trim(),
      description: bugReport.description.trim(),
      email: bugReport.email?.trim() || 'not provided',
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
           request.headers.get('x-real-ip') || 
           'unknown',
      url: request.headers.get('referer') || 'unknown'
    };

    console.error('🐛 BUG REPORT:', JSON.stringify(logEntry, null, 2));

    // In production, you would:
    // 1. Send to Jira, GitHub Issues, or Linear
    // 2. Send email notification to developers
    // 3. Store in database for tracking
    // 4. Create Slack/Discord notification

    // For now, we'll just log it and return success
    // You can add email notification here if needed

    return NextResponse.json({
      success: true,
      message: 'Bug report received. Thank you for helping us improve SpendXP!',
      id: Math.random().toString(36).substr(2, 9) // Generate a simple ID
    });

  } catch (error) {
    console.error('Bug report submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
