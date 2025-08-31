"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined";
  hover?: boolean;
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8"
};

const variantClasses = {
  default: "bg-white border border-gray-200 shadow-sm",
  elevated: "bg-white border border-gray-200 shadow-lg",
  outlined: "bg-white border-2 border-gray-200 shadow-none"
};

export function Card({ 
  children, 
  className = "", 
  padding = "md", 
  variant = "default",
  hover = false 
}: CardProps) {
  return (
    <div 
      className={cn(
        "rounded-xl transition-all duration-200",
        paddingClasses[padding],
        variantClasses[variant],
        hover && "hover:shadow-md hover:border-gray-300",
        className
      )}
    >
      {children}
    </div>
  );
}

// Card Header
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("border-b border-gray-200 pb-4 mb-4", className)}>
      {children}
    </div>
  );
}

// Card Content
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}

// Card Footer
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("border-t border-gray-200 pt-4 mt-4", className)}>
      {children}
    </div>
  );
}
