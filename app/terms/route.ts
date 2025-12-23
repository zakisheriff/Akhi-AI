import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    const htmlPath = path.join(process.cwd(), 'public', 'terms.html');

    try {
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        return new NextResponse(htmlContent, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
    } catch (error) {
        console.error('Error reading terms.html:', error);
        return new NextResponse('Page not found', { status: 404 });
    }
}
