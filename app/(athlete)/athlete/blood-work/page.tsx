'use client'

import Link from 'next/link'
import {
  Droplets,
  Upload,
  ChevronRight,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useBloodTests } from '@/hooks/athlete'
import { TopBar } from '@/components/dashboard/top-bar'

export default function BloodWorkPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { data: bloodTests, isLoading, error } = useBloodTests(user?.id)

  // Show loading while auth is loading OR (user exists AND query is loading)
  if (authLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-muted-foreground">Failed to load blood work data</p>
        </div>
      </div>
    )
  }

  // Safely check for blood tests - bloodTests could be undefined if query is disabled
  const hasBloodTests = Array.isArray(bloodTests) && bloodTests.length > 0

  return (
    <>
      <TopBar title="Blood Work" />
      <div className="p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <p className="text-muted-foreground">
            Track your biomarkers and health trends
          </p>
          <Button className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Upload className="h-4 w-4" />
            Upload Results
          </Button>
        </div>

        {hasBloodTests ? (
        <>
          {/* Test History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Test History</h2>
            </div>

            <div className="divide-y divide-border">
              {bloodTests.map((test) => (
                <Link
                  key={test.id}
                  href={`/athlete/blood-work/${test.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                    <Droplets className="h-6 w-6 text-red-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {new Date(test.test_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </h3>
                      {test.lab_name && (
                        <span className="text-xs text-muted-foreground">• {test.lab_name}</span>
                      )}
                    </div>
                    {test.notes && (
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">{test.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600">
                      Uploaded
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-12 text-center"
        >
          <Droplets className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No Blood Work Results</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Upload your blood test results to track your biomarkers and health trends over time.
          </p>
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Your First Results
          </Button>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6"
      >
        <h3 className="font-semibold mb-2">Why Track Blood Work?</h3>
        <p className="text-sm text-muted-foreground">
          Regular blood tests help monitor your health markers and optimize your training and nutrition.
          Your coach can use this data to fine-tune your programme for better results.
        </p>
      </motion.div>
      </div>
    </>
  )
}
