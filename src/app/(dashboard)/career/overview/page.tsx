import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { mockApplications } from '@/lib/mocks/career';
import { Send, CalendarCheck, BadgeCheck, XCircle, ArrowRight, BriefcaseBusiness } from 'lucide-react';

export default function CareerOverview() {
  const total = mockApplications.length;
  const interviews = mockApplications.filter((a) => a.status === 'Interview').length;
  const offers = mockApplications.filter((a) => a.status === 'Offer').length;
  const rejected = mockApplications.filter((a) => a.status === 'Rejected' || a.status === 'Ghosted').length;

  const recent = mockApplications.slice(0, 4);

  const stats = [
    { label: "Total Applications", value: total, icon: <Send className="w-5 h-5 text-blue-500" /> },
    { label: "Interviews", value: interviews, icon: <CalendarCheck className="w-5 h-5 text-orange-500" /> },
    { label: "Offers", value: offers, icon: <BadgeCheck className="w-5 h-5 text-green-500" /> },
    { label: "Rejected / Ghosted", value: rejected, icon: <XCircle className="w-5 h-5 text-muted-foreground" /> },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      
      <Card className="bg-card border border-border/40 shadow-sm bg-gradient-to-r from-purple-500/10 via-transparent to-transparent rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6">
          <CardHeader className="p-0">
            <CardTitle>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                 <BriefcaseBusiness className="w-8 h-8 text-primary" />
                 Career Hub
              </h1>
            </CardTitle>
            <CardDescription className="text-base mt-2 text-muted-foreground font-medium">
              Your career snapshot and recent job search activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-shrink-0">
            <Button asChild className="rounded-xl shadow-sm transition-all hover:scale-105">
              <Link href="/career/applications">
                View Applications <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
           <Card key={stat.label} className="bg-card border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
             <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
               {stat.label}
             </CardTitle>
             <div className="p-2 bg-muted/50 rounded-xl">
               {stat.icon}
             </div>
           </CardHeader>
           <CardContent className="px-5 pb-5 pt-0">
             <div className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</div>
           </CardContent>
         </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        <Card className="bg-card shadow-sm flex flex-col border border-border/50 rounded-2xl transition-all duration-300 hover:shadow-md hover:border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight">Recent Applications</CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              Your latest job applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 px-4 md:px-6">
            {recent.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border/40 rounded-xl h-full bg-muted/10">
                 <Send className="w-8 h-8 text-muted-foreground/50 mb-2" />
                 <p className="text-sm font-medium text-foreground">No applications yet</p>
                 <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">Start tracking your job search here.</p>
               </div>
            ) : (
              recent.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50 hover:bg-muted/40 transition-colors">
                  <div>
                    <h3 className="font-semibold text-foreground">{app.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground">{app.company}</p>
                    <p className="text-xs font-medium text-muted-foreground mt-1 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-primary/50" />
                      Applied · {app.appliedDate}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground bg-background border border-border/50 shadow-sm px-3 py-1.5 rounded-full">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="flex items-center border-t border-border/50 pt-4 pb-4 px-6 bg-muted/10 rounded-b-2xl">
            <Link href="/career/applications" className="text-sm font-semibold text-muted-foreground hover:text-primary flex items-center transition-colors">
              View all applications <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

        {/* Placeholder for future Analytics / AI Insights */}
        <Card className="bg-card shadow-md border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg">
           <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-purple-500">✨</span> Next Steps
            </CardTitle>
            <CardDescription className="text-sm font-medium text-muted-foreground">
              AI-driven career insights
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 px-4 md:px-6 flex flex-col items-center justify-center text-center py-10">
              <div className="bg-purple-500/10 p-4 rounded-full mb-4 shadow-sm border border-purple-500/20">
                <Send className="w-8 h-8 text-purple-500 opacity-80" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Keep the momentum going</h3>
              <p className="mt-2 text-sm font-medium text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Connect your Resume and track more applications to let Alymera AI suggest your next career move.
              </p>
          </CardContent>
          <CardFooter className="border-t border-purple-500/10 pt-4 pb-4 px-6 bg-purple-500/5 rounded-b-2xl">
             <Link href="/career/assistant" className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center transition-colors">
              Talk to Career Assistant <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
