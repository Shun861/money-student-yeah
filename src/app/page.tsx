"use client";
import { redirect } from "next/navigation";

export default function Home() {
  // ダッシュボードレイアウトを使用するためにリダイレクト
  redirect('/dashboard');
}


